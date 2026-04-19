import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Process, ProcessStatus } from '../process/entities/process.entity';
import { AnalysisResult } from './entities/analysis-result.entity';
import { DocumentService } from '../document/document.service';
import { TextExtractionService } from '../text-extraction/text-extraction.service';
import { AiService } from '../ai/ai.service';
import { ProcessGateway } from '../realtime/process.gateway';
import { ProducerService } from '../queue/producer.service';
import { DocumentStatus } from '../document/entities/document.entity';

@Injectable()
export class AnalysisService {
    constructor(
        @InjectRepository(Process)
        private readonly processRepo: Repository<Process>,

        @InjectRepository(AnalysisResult)
        private readonly analysisRepo: Repository<AnalysisResult>,

        private readonly documentService: DocumentService,
        private readonly textExtractionService: TextExtractionService,
        private readonly aiService: AiService,
        private readonly processGateway: ProcessGateway,
        private readonly producerService: ProducerService,
    ) { }

    async start(processId: string) {
        const process = await this.processRepo.findOne({
            where: { id: processId },
        });

        if (!process) {
            throw new NotFoundException('Process not found');
        }

        const documents = await this.documentService.findByProcess(processId);

        if (!documents.length) {
            throw new BadRequestException(
                'Cannot start a process without uploaded documents',
            );
        }

        if (process.status === ProcessStatus.RUNNING) {
            throw new BadRequestException('Process is already running');
        }

        if (process.status === ProcessStatus.COMPLETED) {
            throw new BadRequestException('Process is already completed');
        }

        if (process.status === ProcessStatus.STOPPED) {
            throw new BadRequestException(
                'Stopped processes cannot be resumed. Create a new process instead.',
            );
        }

        process.status = ProcessStatus.PENDING;
        await this.processRepo.save(process);

        await this.producerService.enqueueProcessAnalysis(processId);

        this.processGateway.emitProcessQueued(processId);

        return {
            processId,
            status: process.status,
            message: 'Process queued successfully',
        };
    }

    async executeAnalysis(processId: string) {
        const process = await this.processRepo.findOne({
            where: { id: processId },
        });

        if (!process) {
            throw new NotFoundException('Process not found');
        }

        const documents = await this.documentService.findByProcess(processId);

        if (!documents.length) {
            throw new BadRequestException(
                'Cannot execute a process without uploaded documents',
            );
        }

        const existingResults = await this.analysisRepo.find({
            where: { processId },
            order: { createdAt: 'ASC' },
        });

        const processedDocumentIds = new Set(
            existingResults.map((result) => result.documentId),
        );

        const pendingDocuments = documents.filter(
            (doc) => !processedDocumentIds.has(doc.id),
        );

        process.status = ProcessStatus.RUNNING;
        await this.processRepo.save(process);

        this.processGateway.emitProcessStarted(processId, documents.length);
        this.processGateway.emitProcessProgress(
            processId,
            existingResults.length,
            documents.length,
        );

        try {
            const results: AnalysisResult[] = [...existingResults];

            for (const doc of pendingDocuments) {
                const currentProcess = await this.processRepo.findOne({
                    where: { id: processId },
                });

                if (!currentProcess) {
                    throw new NotFoundException('Process not found');
                }

                if (currentProcess.status === ProcessStatus.PAUSED) {
                    return {
                        processId,
                        status: currentProcess.status,
                        processedDocuments: results.length,
                        results,
                        message: 'Process paused successfully',
                    };
                }

                if (currentProcess.status === ProcessStatus.STOPPED) {
                    return {
                        processId,
                        status: currentProcess.status,
                        processedDocuments: results.length,
                        results,
                        message: 'Process stopped successfully',
                    };
                }

                this.processGateway.emitDocumentProcessing(
                    processId,
                    doc.id,
                    doc.originalName,
                );

                try {
                    await this.documentService.markAsProcessing(doc.id);

                    const text = await this.textExtractionService.extractFromDocument(
                        doc.storageKey,
                        doc.mimeType,
                    );

                    const normalizedText = text?.trim() ?? '';

                    const totalCharacters = normalizedText.length;
                    const totalLines = normalizedText
                        ? normalizedText.split(/\r?\n/).length
                        : 0;

                    const words =
                        normalizedText.toLowerCase().match(/\b[\p{L}\p{N}']+\b/gu) ?? [];

                    const totalWords = words.length;

                    const frequencyMap = new Map<string, number>();

                    for (const word of words) {
                        frequencyMap.set(word, (frequencyMap.get(word) ?? 0) + 1);
                    }

                    const mostFrequentWords = [...frequencyMap.entries()]
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 10)
                        .map(([word, count]) => ({ word, count }));

                    const summary = normalizedText
                        ? await this.aiService.summarize(normalizedText.slice(0, 12000))
                        : 'No text could be extracted from the document.';

                    const result = this.analysisRepo.create({
                        processId,
                        documentId: doc.id,
                        extractedTextLength: normalizedText.length,
                        summary,
                        totalWords,
                        totalLines,
                        totalCharacters,
                        mostFrequentWords,
                    });

                    const savedResult = await this.analysisRepo.save(result);
                    results.push(savedResult);

                    await this.documentService.markAsDone(doc.id);

                    this.processGateway.emitDocumentCompleted(
                        processId,
                        doc.id,
                        doc.originalName,
                    );

                    this.processGateway.emitProcessProgress(
                        processId,
                        results.length,
                        documents.length,
                    );
                } catch (error) {
                    this.processGateway.emitDocumentFailed(
                        processId,
                        doc.id,
                        doc.originalName,
                        error instanceof Error ? error.message : 'Unknown error',
                    );

                    throw error;
                }
            }

            const finalProcess = await this.processRepo.findOne({
                where: { id: processId },
            });

            if (!finalProcess) {
                throw new NotFoundException('Process not found');
            }

            finalProcess.status = ProcessStatus.COMPLETED;
            await this.processRepo.save(finalProcess);

            this.processGateway.emitProcessCompleted(processId, results.length);

            return {
                processId,
                status: finalProcess.status,
                processedDocuments: results.length,
                results,
            };
        } catch (error) {
            process.status = ProcessStatus.FAILED;
            await this.processRepo.save(process);

            this.processGateway.emitProcessFailed(
                processId,
                error instanceof Error ? error.message : 'Unknown error',
            );

            throw error;
        }
    }

    async pause(processId: string) {
        const process = await this.processRepo.findOne({
            where: { id: processId },
        });

        if (!process) {
            throw new NotFoundException('Process not found');
        }

        if (process.status !== ProcessStatus.RUNNING) {
            throw new BadRequestException('Only running processes can be paused');
        }

        process.status = ProcessStatus.PAUSED;
        await this.processRepo.save(process);

        this.processGateway.emitProcessPaused(processId);

        return {
            processId,
            status: process.status,
            message: 'Pause requested successfully',
        };
    }

    async stop(processId: string) {
        const process = await this.processRepo.findOne({
            where: { id: processId },
        });

        if (!process) {
            throw new NotFoundException('Process not found');
        }

        if (
            process.status === ProcessStatus.COMPLETED ||
            process.status === ProcessStatus.FAILED ||
            process.status === ProcessStatus.STOPPED
        ) {
            throw new BadRequestException(
                'This process cannot be stopped in its current state',
            );
        }

        process.status = ProcessStatus.STOPPED;
        await this.processRepo.save(process);

        this.processGateway.emitProcessStopped(processId);

        return {
            processId,
            status: process.status,
            message: 'Stop requested successfully',
        };
    }

    async resume(processId: string) {
        const process = await this.processRepo.findOne({
            where: { id: processId },
        });

        if (!process) {
            throw new NotFoundException('Process not found');
        }

        if (process.status !== ProcessStatus.PAUSED) {
            throw new BadRequestException('Only paused processes can be resumed');
        }

        process.status = ProcessStatus.PENDING;
        await this.processRepo.save(process);

        this.processGateway.emitProcessResumed(processId);

        await this.producerService.enqueueProcessAnalysis(processId);

        return {
            processId,
            status: process.status,
            message: 'Process resumed and queued',
        };
    }

    async getResults(processId: string) {
        const process = await this.processRepo.findOne({
            where: { id: processId },
            relations: ['documents'],
        });

        if (!process) {
            throw new NotFoundException('Process not found');
        }

        const results = await this.analysisRepo.find({
            where: { processId },
            order: { createdAt: 'ASC' },
        });

        const documents = process.documents ?? [];

        const totalFiles = documents.length;
        const filesProcessed = documents
            .filter((doc) => doc.status === DocumentStatus.DONE)
            .map((doc) => doc.originalName);

        const processedFiles = filesProcessed.length;

        const percentage =
            totalFiles === 0 ? 0 : Math.round((processedFiles / totalFiles) * 100);

        const totalWords = results.reduce(
            (sum, result) => sum + Number(result.totalWords ?? 0),
            0,
        );

        const totalLines = results.reduce(
            (sum, result) => sum + Number(result.totalLines ?? 0),
            0,
        );

        const aggregatedFrequency = new Map<string, number>();

        for (const result of results) {
            for (const item of result.mostFrequentWords ?? []) {
                aggregatedFrequency.set(
                    item.word,
                    (aggregatedFrequency.get(item.word) ?? 0) + item.count,
                );
            }
        }

        const mostFrequentWords = [...aggregatedFrequency.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);

        const documentDetails = documents.map((doc) => {
            const docResult = results.find((result) => result.documentId === doc.id);

            return {
                document_id: doc.id,
                file_name: doc.originalName,
                status: doc.status,
                total_words: Number(docResult?.totalWords ?? 0),
                total_lines: Number(docResult?.totalLines ?? 0),
                total_characters: Number(docResult?.totalCharacters ?? 0),
                most_frequent_words: docResult?.mostFrequentWords ?? [],
                summary: docResult?.summary ?? null,
            };
        });

        return {
            process_id: process.id,
            status: process.status,
            progress: {
                total_files: totalFiles,
                processed_files: processedFiles,
                percentage,
            },
            started_at: process.createdAt,
            estimated_completion: null,
            results: {
                total_words: totalWords,
                total_lines: totalLines,
                most_frequent_words: mostFrequentWords,
                files_processed: filesProcessed,
            },
            documents: documentDetails,
        };
    }
}

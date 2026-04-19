import { useState } from 'react';
import { startAnalysis } from '../api/analysis.api';
import {
  deleteDocumentFromProcess,
  uploadFilesToProcess,
} from '../api/document.api';
import { createProcess } from '../api/process.api';
import type { DocumentItem, ProcessItem } from '../types/process.types';
import { deleteProcess } from '../api/process.api';

type Step = 'idle' | 'created' | 'uploaded' | 'starting';

export function useCreateProcessFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [process, setProcess] = useState<ProcessItem | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentItem[]>([]);
  const [step, setStep] = useState<Step>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = async () => {
    try {
      setLoading(true);
      setError(null);

      const created = await createProcess();

      setProcess(created);
      setIsOpen(true);
      setStep('created');
      setFiles([]);
      setUploadedDocuments([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create process');
    } finally {
      setLoading(false);
    }
  };

  const close = async () => {
    try {
      if (process && uploadedDocuments.length === 0) {
        await deleteProcess(process.id);
      }
    } catch {
      // opcional
    }

    setIsOpen(false);
    setProcess(null);
    setFiles([]);
    setUploadedDocuments([]);
    setStep('idle');
    setError(null);
  };

  const upload = async () => {
    if (!process) return;

    if (files.length === 0) {
      setError('Please select at least one file before uploading');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await uploadFilesToProcess(process.id, files);
      setUploadedDocuments(result.documents);
      setFiles([]);
      setStep('uploaded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const removeUploadedDocument = async (documentId: string) => {
    if (!process) return;

    try {
      setLoading(true);
      setError(null);

      await deleteDocumentFromProcess(process.id, documentId);

      const nextDocuments = uploadedDocuments.filter(
        (doc) => doc.id !== documentId,
      );

      setUploadedDocuments(nextDocuments);

      if (nextDocuments.length === 0) {
        setStep('created');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete document',
      );
    } finally {
      setLoading(false);
    }
  };

  const start = async () => {
    if (!process) return null;

    try {
      setLoading(true);
      setError(null);
      setStep('starting');

      await startAnalysis(process.id);

      return process.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      setStep('uploaded');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeSelectedFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  return {
    isOpen,
    process,
    files,
    setFiles,
    uploadedDocuments,
    step,
    loading,
    error,
    open,
    close,
    upload,
    removeSelectedFile,
    removeUploadedDocument,
    start,
  };
}
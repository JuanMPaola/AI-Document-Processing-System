import { useState } from 'react';
import { startAnalysis } from '../api/analysis.api';
import { uploadFilesToProcess } from '../api/document.api';
import { createProcess } from '../api/process.api';
import type { DocumentItem, ProcessItem } from '../types/process.types';

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

  const close = () => {
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
    start,
  };
}
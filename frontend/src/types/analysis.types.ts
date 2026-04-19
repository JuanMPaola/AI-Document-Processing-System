export interface FrequentWord {
  word: string;
  count: number;
}

export interface AnalysisDocumentResult {
  document_id: string;
  file_name: string;
  status: string;
  total_words: number;
  total_lines: number;
  total_characters: number;
  most_frequent_words: FrequentWord[];
  summary: string | null;
}

export interface AnalysisAggregateResults {
  total_words: number;
  total_lines: number;
  most_frequent_words: string[];
  files_processed: string[];
}

export interface AnalysisResultsResponse {
  process_id: string;
  status: string;
  progress: {
    total_files: number;
    processed_files: number;
    percentage: number;
  };
  started_at: string | null;
  estimated_completion: string | null;
  results: AnalysisAggregateResults;
  documents: AnalysisDocumentResult[];
}

export interface ProcessStatusResponse {
  process_id: string;
  status: string;
  progress: {
    total_files: number;
    processed_files: number;
    percentage: number;
  };
  started_at: string | null;
  estimated_completion: string | null;
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  return res.json();
}

export async function uploadFilesToProcess(
  processId: string,
  files: File[],
) {
  const formData = new FormData();

  for (const file of files) {
    formData.append('files', file);
  }

  const res = await fetch(`${API_URL}/process/${processId}/files`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<{
    processId: string;
    uploadedCount: number;
    documents: {
      id: string;
      processId: string;
      originalName: string;
      mimeType: string;
      size: number;
      storageKey: string;
      status: string;
      createdAt: string;
    }[];
  }>(res);
}

export async function deleteDocumentFromProcess(
  processId: string,
  documentId: string,
) {
  const res = await fetch(
    `${API_URL}/process/${processId}/files/${documentId}`,
    {
      method: 'DELETE',
    },
  );

  return handleResponse<{ deleted: true }>(res);
}
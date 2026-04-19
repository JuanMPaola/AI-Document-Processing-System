const API_URL = 'http://localhost:3000';

async function handleResponse(res: Response) {
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Request failed');
    }
    return res.json();
}

export async function createProcess() {
    const res = await fetch(`${API_URL}/process`, {
        method: 'POST',
    });
    return handleResponse(res);
}

export async function uploadFiles(processId: string, files: File[]) {
    const formData = new FormData();

    for (const file of files) {
        formData.append('files', file);
    }

    const res = await fetch(
        `${API_URL}/documents/${processId}/upload`,
        {
            method: 'POST',
            body: formData,
        },
    );

    const data = await handleResponse(res);

    return {
        processId,
        uploadedCount: data.documents?.length ?? 0,
        documents: data.documents ?? data,
    };
}
export async function startAnalysis(processId: string) {
    const res = await fetch(`${API_URL}/analysis/${processId}/start`, {
        method: 'POST',
    });
    return handleResponse(res);
}

export async function pauseAnalysis(processId: string) {
    const res = await fetch(`${API_URL}/analysis/${processId}/pause`, {
        method: 'POST',
    });
    return handleResponse(res);
}

export async function resumeAnalysis(processId: string) {
    const res = await fetch(`${API_URL}/analysis/${processId}/resume`, {
        method: 'POST',
    });
    return handleResponse(res);
}

export async function stopAnalysis(processId: string) {
    const res = await fetch(`${API_URL}/analysis/${processId}/stop`, {
        method: 'POST',
    });
    return handleResponse(res);
}

export async function getResults(processId: string) {
    const res = await fetch(`${API_URL}/analysis/${processId}/results`);
    return handleResponse(res);
}
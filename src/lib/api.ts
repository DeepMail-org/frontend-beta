import type {
	UploadResponse,
	EmailAnalysisReport,
	HealthResponse,
} from "./types";

const API_BASE =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/** Get stored JWT token */
function getToken(): string | null {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("deepmail_token");
}

/** Set JWT token */
export function setToken(token: string): void {
	localStorage.setItem("deepmail_token", token);
}

/** Build headers with auth */
function authHeaders(extra?: Record<string, string>): HeadersInit {
	const headers: Record<string, string> = {
		...extra,
	};
	const token = getToken();
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}
	return headers;
}

/** Generic fetch wrapper with error handling */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
	const url = `${API_BASE}${path}`;
	const res = await fetch(url, {
		...init,
		headers: {
			...authHeaders(),
			...init?.headers,
		},
	});

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(`API ${res.status}: ${body || res.statusText}`);
	}

	return res.json();
}

/** POST /api/v1/upload — Upload file for analysis */
export async function uploadFile(file: File): Promise<UploadResponse> {
	const formData = new FormData();
	formData.append("file", file);

	const url = `${API_BASE}/upload`;
	const res = await fetch(url, {
		method: "POST",
		headers: authHeaders(),
		body: formData,
	});

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		throw new Error(
			`Upload failed (${res.status}): ${body || res.statusText}`,
		);
	}

	return res.json();
}

/** GET /api/v1/results/:email_id — Fetch analysis report */
export async function getResults(
	emailId: string,
): Promise<EmailAnalysisReport> {
	return apiFetch<EmailAnalysisReport>(`/results/${emailId}`);
}

/** GET /api/v1/health — Health check */
export async function getHealth(): Promise<HealthResponse> {
	return apiFetch<HealthResponse>("/health");
}

/** Create WebSocket connection for live progress */
export function createProgressWebSocket(
	emailId: string,
	onMessage: (event: MessageEvent) => void,
	onError?: (event: Event) => void,
	onClose?: (event: CloseEvent) => void,
): WebSocket {
	const wsBase =
		process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001/api/v1";
	const token = getToken();
	const url = `${wsBase}/ws/results/${emailId}${token ? `?token=${token}` : ""}`;

	const ws = new WebSocket(url);
	ws.onmessage = onMessage;
	if (onError) ws.onerror = onError;
	if (onClose) ws.onclose = onClose;

	return ws;
}

import type {
  BackendHealthResponse,
  ExecuteRequestPayload,
  ExecuteResponsePayload,
} from "@/types/api";

/**
 * CODEFLOW AI — Frontend API Integration Layer (Phase 2 Active)
 *
 * Connects the Next.js workspace to the isolated FastAPI Python 3.12
 * execution and snapshot tracing service.
 */

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000",
  timeoutMs: 12_000,
  phase: 2 as const,
} as const;

export class ApiClientError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, code = "API_ERROR", statusCode = 503) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

async function requestJson<TResponse>(
  endpoint: string,
  options: RequestInit = {}
): Promise<TResponse> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail = `Backend returned HTTP ${response.status}`;
      try {
        const errBody = (await response.json()) as { detail?: unknown };
        if (typeof errBody.detail === "string") {
          detail = errBody.detail;
        }
      } catch {
        // Ignore JSON parse fallback
      }
      throw new ApiClientError(detail, "HTTP_ERROR", response.status);
    }

    return (await response.json()) as TResponse;
  } catch (err) {
    if (err instanceof ApiClientError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiClientError(
        "Execution request timed out while waiting for the Python backend.",
        "CLIENT_TIMEOUT",
        504
      );
    }
    throw new ApiClientError(
      `Cannot reach FastAPI execution backend at ${API_CONFIG.baseUrl}. Ensure the Python backend server is running on port 8000.`,
      "BACKEND_UNREACHABLE",
      503
    );
  } finally {
    window.clearTimeout(timer);
  }
}

export const codeflowApi = {
  async checkHealth(): Promise<BackendHealthResponse> {
    return requestJson<BackendHealthResponse>("/api/health", {
      method: "GET",
    });
  },

  async executePython(
    payload: ExecuteRequestPayload
  ): Promise<ExecuteResponsePayload> {
    return requestJson<ExecuteResponsePayload>("/api/execute", {
      method: "POST",
      body: JSON.stringify({
        source_code: payload.source_code,
        options: {
          max_steps: payload.options?.max_steps ?? 500,
          timeout_seconds: payload.options?.timeout_seconds ?? 3.5,
          stdin: payload.options?.stdin ?? null,
        },
      }),
    });
  },
};

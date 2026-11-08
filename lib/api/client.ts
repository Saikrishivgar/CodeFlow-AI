import type {
  BackendHealthResponse,
  ExecuteRequestPayload,
  ExecuteResponsePayload,
} from "@/types/api";
import type {
  DSATopicGuide,
  TutorChatRequestPayload,
  TutorChatResponsePayload,
  TutorConversationDetail,
  TutorConversationSummary,
  TutorProviderId,
  TutorProvidersStatusResponse,
} from "@/types/tutor";

/**
 * CODEFLOW AI — Frontend API Integration Layer (Phases 2–4 Active)
 *
 * Connects the Next.js workspace to the isolated FastAPI Python 3.12
 * execution/tracing engine and the Provider-Independent AI Tutor service.
 */

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000",
  timeoutMs: 25_000,
  phase: 4 as const,
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
        "Request timed out while waiting for the FastAPI backend.",
        "CLIENT_TIMEOUT",
        504
      );
    }
    throw new ApiClientError(
      `Cannot reach FastAPI backend at ${API_CONFIG.baseUrl}. Ensure the Python backend server is running on port 8000.`,
      "BACKEND_UNREACHABLE",
      503
    );
  } finally {
    window.clearTimeout(timer);
  }
}

export interface StreamTutorCallbacks {
  onDelta: (
    delta: string,
    provider: TutorProviderId,
    model: string
  ) => void;
  onDone: (payload: TutorChatResponsePayload) => void;
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

  async getTutorProviders(): Promise<TutorProvidersStatusResponse> {
    return requestJson<TutorProvidersStatusResponse>("/api/tutor/providers", {
      method: "GET",
    });
  },

  async getDsaTopics(): Promise<DSATopicGuide[]> {
    return requestJson<DSATopicGuide[]>("/api/tutor/dsa-topics", {
      method: "GET",
    });
  },

  async listTutorConversations(): Promise<TutorConversationSummary[]> {
    return requestJson<TutorConversationSummary[]>("/api/tutor/conversations", {
      method: "GET",
    });
  },

  async getTutorConversation(
    conversationId: string
  ): Promise<TutorConversationDetail> {
    return requestJson<TutorConversationDetail>(
      `/api/tutor/conversations/${encodeURIComponent(conversationId)}`,
      { method: "GET" }
    );
  },

  async deleteTutorConversation(
    conversationId: string
  ): Promise<{ deleted: boolean }> {
    return requestJson<{ deleted: boolean }>(
      `/api/tutor/conversations/${encodeURIComponent(conversationId)}`,
      { method: "DELETE" }
    );
  },

  async sendTutorChat(
    payload: TutorChatRequestPayload
  ): Promise<TutorChatResponsePayload> {
    return requestJson<TutorChatResponsePayload>("/api/tutor/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async streamTutorChat(
    payload: TutorChatRequestPayload,
    callbacks: StreamTutorCallbacks
  ): Promise<void> {
    const controller = new AbortController();
    const timer = window.setTimeout(
      () => controller.abort(),
      API_CONFIG.timeoutMs
    );

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/api/tutor/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = `Tutor service returned HTTP ${response.status}`;
        try {
          const errBody = (await response.json()) as { detail?: unknown };
          if (typeof errBody.detail === "string") {
            detail = errBody.detail;
          }
        } catch {
          // ignore
        }
        throw new ApiClientError(detail, "TUTOR_HTTP_ERROR", response.status);
      }

      if (!response.body) {
        const fallback = await codeflowApi.sendTutorChat(payload);
        callbacks.onDone(fallback);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let receivedDone = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;
          const jsonStr = line.slice(5).trim();
          if (!jsonStr) continue;

          const event = JSON.parse(jsonStr) as {
            type: "delta" | "done" | "error";
            delta?: string;
            provider?: TutorProviderId;
            model?: string;
            code?: string;
            message?: unknown;
            conversation_id?: string;
            used_fallback?: boolean;
            fallback_reason?: string | null;
            suggested_questions?: string[];
          };

          if (event.type === "delta" && event.delta) {
            callbacks.onDelta(
              event.delta,
              event.provider ?? payload.provider,
              event.model ?? ""
            );
          } else if (event.type === "error") {
            throw new ApiClientError(
              typeof event.message === "string"
                ? event.message
                : "AI Tutor provider error.",
              event.code ?? "PROVIDER_ERROR",
              502
            );
          } else if (event.type === "done" && event.conversation_id) {
            receivedDone = true;
            callbacks.onDone({
              conversation_id: event.conversation_id,
              message: event.message as TutorChatResponsePayload["message"],
              provider: event.provider ?? payload.provider,
              model: event.model ?? "",
              used_fallback: Boolean(event.used_fallback),
              fallback_reason: event.fallback_reason ?? null,
              suggested_questions: event.suggested_questions ?? [],
            });
          }
        }
      }

      if (!receivedDone) {
        const fallback = await codeflowApi.sendTutorChat(payload);
        callbacks.onDone(fallback);
      }
    } finally {
      window.clearTimeout(timer);
    }
  },
};

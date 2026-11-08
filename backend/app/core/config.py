from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass(frozen=True)
class BackendSettings:
    app_name: str = "CODEFLOW AI Execution Engine"
    version: str = "0.2.0"
    host: str = os.getenv("CODEFLOW_BACKEND_HOST", "127.0.0.1")
    port: int = int(os.getenv("CODEFLOW_BACKEND_PORT", "8000"))

    # Execution mode: "auto" | "docker" | "development_subprocess"
    # Note: development_subprocess is strictly for local development on 127.0.0.1
    execution_mode_preference: str = os.getenv("CODEFLOW_EXECUTION_MODE", "auto")
    docker_image: str = os.getenv("CODEFLOW_RUNNER_IMAGE", "codeflow-python-runner:3.12")

    # Safety & resource limits
    default_timeout_seconds: float = float(
        os.getenv("CODEFLOW_DEFAULT_TIMEOUT", "3.0")
    )
    max_timeout_seconds: float = float(os.getenv("CODEFLOW_MAX_TIMEOUT", "8.0"))
    default_max_steps: int = int(os.getenv("CODEFLOW_DEFAULT_MAX_STEPS", "500"))
    hard_max_steps: int = int(os.getenv("CODEFLOW_HARD_MAX_STEPS", "1500"))
    max_memory_mb: int = int(os.getenv("CODEFLOW_MAX_MEMORY_MB", "128"))
    max_output_bytes: int = int(os.getenv("CODEFLOW_MAX_OUTPUT_BYTES", "32768"))
    max_source_chars: int = int(os.getenv("CODEFLOW_MAX_SOURCE_CHARS", "25000"))
    max_recursion_depth: int = int(os.getenv("CODEFLOW_MAX_RECURSION_DEPTH", "90"))
    max_container_items: int = 50
    max_serialize_depth: int = 5

    cors_origins: list[str] = field(
        default_factory=lambda: [
            origin.strip()
            for origin in os.getenv(
                "CODEFLOW_CORS_ORIGINS",
                "http://localhost:3000,http://127.0.0.1:3000",
            ).split(",")
            if origin.strip()
        ]
    )


settings = BackendSettings()


from __future__ import annotations

import json
import os
import resource
import signal
import sys
from typing import Any

# Ensure backend root is importable even when invoked with `python -I` inside temp dir
_BACKEND_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

from app.execution.error_formatter import (  # noqa: E402
    ExecutionTimeoutError,
    SecurityRestrictionError,
)
from app.execution.tracer import PythonExecutionTracer  # noqa: E402

_STDLIB_PREFIXES = tuple(
    os.path.realpath(p)
    for p in {
        sys.prefix,
        sys.base_prefix,
        sys.exec_prefix,
        sys.base_exec_prefix,
        _BACKEND_ROOT,
    }
    if p
)

_BLOCKED_EXACT_EVENTS = frozenset(
    {
        "socket.__new__",
        "socket.bind",
        "socket.connect",
        "socket.getaddrinfo",
        "socket.sendto",
        "os.system",
        "os.popen",
        "os.fork",
        "os.forkpty",
        "os.exec",
        "os.posix_spawn",
        "os.posix_spawnp",
        "os.spawn",
        "subprocess.Popen",
        "ctypes.dlopen",
        "os.remove",
        "os.unlink",
        "os.rmdir",
        "os.mkdir",
        "os.rename",
        "os.replace",
        "os.chmod",
        "os.chown",
        "os.chdir",
        "os.listdir",
        "os.scandir",
        "shutil.rmtree",
    }
)


def _apply_posix_limits(max_memory_mb: int, timeout_seconds: float) -> None:
    cpu_seconds = max(2, int(timeout_seconds) + 2)
    try:
        resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds + 1))
    except (ValueError, OSError):
        pass

    # Cap file creation size inside worker to 1 MB
    try:
        resource.setrlimit(resource.RLIMIT_FSIZE, (1024 * 1024, 1024 * 1024))
    except (ValueError, OSError):
        pass

    # Cap open file descriptors
    try:
        resource.setrlimit(resource.RLIMIT_NOFILE, (64, 64))
    except (ValueError, OSError):
        pass

    # Cap virtual/data memory on platforms that enforce RLIMIT_AS / RLIMIT_DATA (Linux/Docker)
    mem_bytes = max_memory_mb * 1024 * 1024
    for limit_attr in ("RLIMIT_AS", "RLIMIT_DATA"):
        rlim = getattr(resource, limit_attr, None)
        if rlim is not None:
            try:
                resource.setrlimit(rlim, (mem_bytes, mem_bytes))
                break
            except (ValueError, OSError):
                continue


def _install_audit_sandbox(armed_ref: list[bool]) -> None:
    def _audit_hook(event: str, args: tuple[Any, ...]) -> None:
        if not armed_ref[0]:
            return

        if event in _BLOCKED_EXACT_EVENTS or event.startswith(
            ("socket.", "subprocess.", "urllib.")
        ):
            raise SecurityRestrictionError(
                f"Operation '{event}' is disabled in the isolated execution sandbox."
            )

        if event == "open":
            target = args[0] if len(args) > 0 else None
            mode = args[1] if len(args) > 1 else "r"
            if isinstance(mode, str) and any(
                flag in mode for flag in ("w", "a", "x", "+")
            ):
                raise SecurityRestrictionError(
                    "Writing files is disabled in the isolated execution sandbox."
                )
            if isinstance(target, int):
                raise SecurityRestrictionError(
                    "Opening raw file descriptors is disabled in the execution sandbox."
                )
            if isinstance(target, (str, bytes, os.PathLike)):
                raw_path = os.fsdecode(target)
                real_path = os.path.realpath(raw_path)
                if not any(
                    real_path == prefix or real_path.startswith(prefix + os.sep)
                    for prefix in _STDLIB_PREFIXES
                ):
                    raise SecurityRestrictionError(
                        "Reading arbitrary host files is disabled in the execution sandbox."
                    )

    sys.addaudithook(_audit_hook)


def main() -> int:
    raw_input = sys.stdin.read()
    request = json.loads(raw_input)

    source_code: str = request.get("source_code", "")
    stdin_data: str | None = request.get("stdin")
    max_steps: int = int(request.get("max_steps", 500))
    timeout_seconds: float = float(request.get("timeout_seconds", 3.0))
    max_memory_mb: int = int(request.get("max_memory_mb", 128))
    max_output_bytes: int = int(request.get("max_output_bytes", 32768))
    max_recursion_depth: int = int(request.get("max_recursion_depth", 90))

    real_stdout = sys.__stdout__

    _apply_posix_limits(max_memory_mb=max_memory_mb, timeout_seconds=timeout_seconds)

    # Install inner SIGALRM wall-clock timer so CPU-spinning loops preserve partial traces
    soft_timeout = max(0.3, timeout_seconds - 0.25)

    def _handle_timeout(_signum: int, _frame: Any) -> None:
        raise ExecutionTimeoutError(timeout_seconds)

    signal.signal(signal.SIGALRM, _handle_timeout)
    signal.setitimer(signal.ITIMER_REAL, soft_timeout)

    tracer = PythonExecutionTracer(
        max_steps=max_steps,
        max_output_bytes=max_output_bytes,
        max_recursion_depth=max_recursion_depth,
    )

    armed_ref = [True]
    _install_audit_sandbox(armed_ref)

    try:
        payload = tracer.execute(source_code=source_code, stdin_data=stdin_data)
    finally:
        armed_ref[0] = False
        signal.setitimer(signal.ITIMER_REAL, 0.0)

    serialized_json = json.dumps(payload.to_dict(), allow_nan=False)
    real_stdout.write(serialized_json)
    real_stdout.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


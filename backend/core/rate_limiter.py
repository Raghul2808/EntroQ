"""
In-memory sliding window rate limiter for quantum endpoint protection.
Prevents denial-of-service and protects quantum backend resources.
"""
import time
from collections import defaultdict
from threading import Lock
from fastapi import HTTPException, Request, status


class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)
        self.lock = Lock()

    def check(self, request: Request):
        # Extract client IP
        client_ip = request.client.host if request.client else "127.0.0.1"
        # Respect X-Forwarded-For if behind a proxy
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()

        now = time.time()
        cutoff = now - self.window_seconds

        with self.lock:
            # Purge timestamps older than window
            timestamps = [t for t in self.requests[client_ip] if t > cutoff]
            if len(timestamps) >= self.max_requests:
                oldest = timestamps[0]
                retry_after = int(self.window_seconds - (now - oldest)) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded: maximum {self.max_requests} quantum generations per minute. Try again in {retry_after} seconds.",
                    headers={"Retry-After": str(retry_after)},
                )

            timestamps.append(now)
            self.requests[client_ip] = timestamps


# Default global rate limiter: 30 requests/minute
rate_limiter = SlidingWindowRateLimiter(max_requests=30, window_seconds=60)

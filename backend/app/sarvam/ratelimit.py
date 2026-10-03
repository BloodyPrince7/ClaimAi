import asyncio
import time

class TokenBucket:
    def __init__(self, rate_per_min: int, burst: int):
        self.rate = rate_per_min / 60.0  # tokens per second
        self.burst = burst
        self.tokens = float(burst)
        self.last_update = time.monotonic()
        self.lock = asyncio.Lock()

    async def acquire(self, tokens: int = 1):
        async with self.lock:
            now = time.monotonic()
            elapsed = now - self.last_update
            self.last_update = now
            self.tokens = min(self.burst, self.tokens + elapsed * self.rate)

            if self.tokens < tokens:
                wait_time = (tokens - self.tokens) / self.rate
                await asyncio.sleep(wait_time)
                self.tokens = 0
            else:
                self.tokens -= tokens

BUCKETS = {
    "docai": TokenBucket(rate_per_min=9, burst=9),     # stay safely under 10/min
    "chat": TokenBucket(rate_per_min=50, burst=10),
    "speech": TokenBucket(rate_per_min=50, burst=10),
    "translate": TokenBucket(rate_per_min=50, burst=20),
}

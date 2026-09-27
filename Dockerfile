# Multi-stage Python Container for Quantum Random Password Generator
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies for C-extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Final Runtime Image
FROM python:3.12-slim AS runtime

WORKDIR /app

# Install runtime dependencies for matplotlib & math libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set headless environment for matplotlib
ENV MPLBACKEND=Agg
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

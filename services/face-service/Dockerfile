FROM python:3.11-slim AS runner

WORKDIR /app

# Prevent Python from writing bytecode and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    INSIGHTFACE_HOME=/app/app/models_cache

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create models cache directory for weights downloaded at build
RUN mkdir -p /app/app/models_cache

COPY app/ ./app/

EXPOSE 3004

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3004"]

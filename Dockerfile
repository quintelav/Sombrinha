FROM node:22-alpine AS frontend-build

WORKDIR /workspace
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./frontend/
WORKDIR /workspace/frontend
RUN npm run build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py ./
COPY controllers/ ./controllers/
COPY models/ ./models/
COPY views/ ./views/
COPY --from=frontend-build /workspace/frontend/dist/ ./frontend/dist/

EXPOSE 10000
CMD ["sh", "-c", "gunicorn --workers 1 --threads 4 --timeout 60 --bind 0.0.0.0:${PORT:-10000} app:app"]

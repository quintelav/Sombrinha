FROM node:22-alpine AS frontend-build

WORKDIR /workspace/frontend-react
COPY frontend-react/package.json frontend-react/package-lock.json ./
RUN npm ci
COPY frontend-react/ ./
RUN npm run build

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-build /workspace/frontend-react/dist/ ./frontend-react/dist/

EXPOSE 10000
WORKDIR /app/backend
CMD ["sh", "-c", "gunicorn --workers 1 --threads 4 --timeout 60 --bind 0.0.0.0:${PORT:-10000} app:app"]

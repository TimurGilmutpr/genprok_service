#!/bin/bash
set -e

# Запуск gunicorn
echo "Запускаем gunicorn на порту 8000..."
exec gunicorn -w 1 -k uvicorn.workers.UvicornWorker app:app \
    --bind 0.0.0.0:8000 \
    --timeout 300 \
    --graceful-timeout 300

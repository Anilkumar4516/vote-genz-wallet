.PHONY: install run worker test migrate docker-up docker-down clean

install:
	pip install -r requirements.txt

run:
	python -m uvicorn cmd.server.main:app --host 0.0.0.0 --port 8000 --reload

worker:
	python cmd/worker/worker.py

test:
	pytest tests/ -v

migrate:
	alembic upgrade head

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

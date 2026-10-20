.PHONY: install run run-prod worker test migrate docker-up docker-down clean help

PYTHON ?= $(shell if [ -f .venv/bin/python ]; then echo .venv/bin/python; elif [ -f .venv/Scripts/python.exe ]; then echo .venv/Scripts/python.exe; else echo python; fi)
PYTEST ?= $(shell if [ -f .venv/bin/pytest ]; then echo .venv/bin/pytest; elif [ -f .venv/Scripts/pytest.exe ]; then echo .venv/Scripts/pytest.exe; else echo pytest; fi)

install:
	$(PYTHON) -m pip install -r requirements.txt

run:
	$(PYTHON) -m uvicorn cmd.server.main:app --host 0.0.0.0 --port 8000 --reload

run-prod:
	$(PYTHON) -m uvicorn cmd.server.main:app --host 0.0.0.0 --port 8000 --workers 4

worker:
	$(PYTHON) cmd/worker/worker.py

test:
	$(PYTEST) tests/ -v

migrate:
	$(PYTHON) -m alembic upgrade head

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

clean:
	$(PYTHON) -c "import pathlib, shutil; [shutil.rmtree(p) for p in pathlib.Path('.').rglob('__pycache__')]; [p.unlink() for p in pathlib.Path('.').rglob('*.pyc')]"

help:
	@echo "Available commands:"
	@echo "  make install    - Install Python dependencies"
	@echo "  make run        - Run FastAPI API server with hot reloading (Port 8000)"
	@echo "  make run-prod   - Run FastAPI with 4 high-concurrency production workers"
	@echo "  make worker     - Run asynchronous Redis Stream Merkle ingestion worker"
	@echo "  make test       - Execute pytest test suite"
	@echo "  make docker-up  - Launch full production Docker Compose stack"

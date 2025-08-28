FROM python:3.11-slim

WORKDIR /backend

# Copy requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code
COPY backend/ .

# Expose the port FastAPI runs on
EXPOSE 8000

# Start the FastAPI app using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Testing the server in development
# CMD ["fastapi", "dev", "main.py", "--host", "127.0.0.1", "--port", "8000:8000"]
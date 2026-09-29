# Friendship Court AI - Backend

FastAPI backend for the Friendship Court AI application.

## Environment Variables

Required environment variables:

- `GEMINI_API_KEY`: Your Google Gemini API key for AI functionality
- `MOCK_AI_MODE`: Set to `true` to use mock responses without an API key (for testing)

## Local Development

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file:
```bash
GEMINI_API_KEY=your_api_key_here
MOCK_AI_MODE=false
```

4. Run the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Deployment Options

### Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Add environment variables
5. Deploy

### Railway
1. Create a new project on Railway
2. Add a Python service
3. Connect your GitHub repository
4. Set root directory to `backend`
5. Add environment variables
6. Deploy

## Start Command

The recommended start command for deployment:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Health Check

The API includes a health check endpoint:
```
GET /health
```

## CORS Configuration

The backend is configured to allow requests from any origin in development. For production, update the CORS configuration in `app/main.py` to only allow your specific Vercel domain.

# AI-First CRM HCP Module

## Setup Instructions

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Tech Stack
- Frontend: React + Redux + Vite
- Backend: Python FastAPI
- AI Agent: LangGraph
- LLM: Groq (llama-3.3-70b-versatile)
- Database: SQLite

## Features
- Log HCP interactions via structured form
- Log via AI chat — LLM extracts entities automatically
- 5 LangGraph tools: Log, Edit, Search HCP, Schedule, Recommend
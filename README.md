# 🧠 CodeMind — AI-Powered GitHub Codebase Explorer

A full-stack application that lets you index any GitHub repository and chat with it using natural language AI. Built with FastAPI, React, LangChain, ChromaDB, Sentence Transformers, and Groq's LLaMA 70B.

## 🏗️ Architecture

```
github-code-assistant/
├── backend/          # FastAPI REST API
│   ├── main.py       # App entrypoint
│   ├── routes/       # Auth, Repos, Chat
│   ├── services/     # Indexer (GitLoader + ChromaDB) + RAG (LangChain + Groq)
│   └── requirements.txt
└── frontend/         # React + Vite + Tailwind
    └── src/
        ├── pages/    # Login, Register, Dashboard
        └── components/ # ChatInterface, RepoSidebar
```

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

---

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The UI will be available at `http://localhost:5173`

---

## 🔧 Configuration

The backend `.env` file is pre-configured:

```env
MONGODB_URI=mongodb+srv://...
SECRET_KEY=...
GROQ_API_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CHROMA_PERSIST_DIR=./chroma_db
```

---

## 🚀 How It Works

1. **Register/Login** → JWT authentication with MongoDB
2. **Index Repo** → Paste a GitHub URL:
   - LangChain's `GitLoader` clones the repo
   - Code is split with language-aware text splitters
   - `all-MiniLM-L6-v2` sentence transformer embeds each chunk
   - Embeddings stored in ChromaDB (persisted locally)
3. **Chat** → Ask questions:
   - Your question is embedded and semantically searched against code chunks
   - Top 6 relevant chunks are retrieved
   - LangChain + Groq's `llama-3.3-70b-versatile` generates a grounded answer
   - Source files are shown with relevance scores

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Get JWT token
- `GET /api/auth/me` — Current user

### Repositories
- `POST /api/repos/index` — Index a GitHub repo
- `GET /api/repos/` — List user's repos
- `GET /api/repos/{id}` — Get repo status
- `DELETE /api/repos/{id}` — Delete repo

### Chat
- `POST /api/chat/ask` — Ask a question
- `GET /api/chat/history/{repo_id}` — Get chat history
- `DELETE /api/chat/history/{repo_id}` — Clear history

---

## 💡 Example Questions

- "Where is the authentication logic?"
- "How do I add a new API route based on the existing pattern?"
- "What database schema is used?"
- "How are errors handled in this application?"
- "Show me the main entry point and how the app bootstraps"

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | FastAPI + Uvicorn |
| Auth | JWT (python-jose) + bcrypt |
| Database | MongoDB (Motor async driver) |
| Git Loading | LangChain GitLoader |
| Embeddings | Sentence Transformers (all-MiniLM-L6-v2) |
| Vector Store | ChromaDB (persistent) |
| LLM | Groq LLaMA 3.3 70B via LangChain |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + Custom cyberpunk theme |

---

## ⚠️ Notes

- First-time indexing downloads the sentence transformer model (~90MB)
- Large repos may take 2-5 minutes to index
- ChromaDB data persists in `backend/chroma_db/`
- MongoDB stores users, repo metadata, and chat history

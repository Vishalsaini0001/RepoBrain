from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db
from routes.auth import router as auth_router
from routes.repos import router as repo_router
from routes.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="GitHub Code Assistant API",
    description="AI-powered codebase exploration and Q&A",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(repo_router)
app.include_router(chat_router)


@app.get("/")
async def root():
    return {"message": "GitHub Code Assistant API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

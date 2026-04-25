from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api.interactions import router
import app.models.interaction

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CRM HCP Module API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "CRM HCP API is running!"}
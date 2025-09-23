from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI

from strata_ai.api.v1 import auth

load_dotenv()
app = FastAPI()

v1_router = APIRouter(prefix="/v1")
v1_router.include_router(auth.router)

app.include_router(v1_router)

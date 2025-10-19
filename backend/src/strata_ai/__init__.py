from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from strata_ai.api.v1 import organizations
from strata_ai.core.config import Config
from strata_ai.middlewares.exception_handler import http_exception_handler

load_dotenv()

app = FastAPI(default_response_class=ORJSONResponse)

app.exception_handler(HTTPException)(http_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ORIGIN_URLS.split("|"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

v1_router = APIRouter(prefix="/v1")
v1_router.include_router(organizations.router)

app.include_router(v1_router)

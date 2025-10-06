from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from fastapi.responses import ORJSONResponse

from strata_ai.api.v1 import auth, organizations
from strata_ai.middlewares.response_wrapper import wrap_response

load_dotenv()

app = FastAPI(default_response_class=ORJSONResponse)

app.middleware("http")(wrap_response)


v1_router = APIRouter(prefix="/v1")
v1_router.include_router(auth.router)
v1_router.include_router(organizations.router)

app.include_router(v1_router)

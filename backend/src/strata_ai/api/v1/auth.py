from fastapi import APIRouter

from strata_ai.auth.backend import auth_backend, fastapi_users
from strata_ai.schemas.user import UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])

router.include_router(fastapi_users.get_auth_router(auth_backend))

router.include_router(fastapi_users.get_register_router(UserRead, UserCreate))

router.include_router(fastapi_users.get_verify_router(UserRead))

router.include_router(fastapi_users.get_reset_password_router())

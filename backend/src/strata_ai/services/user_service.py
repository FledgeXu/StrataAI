# src/app/services/user_service.py
import uuid
from typing import AsyncGenerator, Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, UUIDIDMixin

from strata_ai.core.config import Config
from strata_ai.db.engine import get_async_session
from strata_ai.models import User
from strata_ai.repos.user_repo import UserRepository

SECRET = Config.SECRET


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")


async def get_user_manager(
    repo: UserRepository = Depends(
        lambda session=Depends(get_async_session): UserRepository(session)
    ),
) -> AsyncGenerator[UserManager, None]:
    yield UserManager(repo.get_impl())

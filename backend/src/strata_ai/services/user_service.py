import uuid
from collections.abc import AsyncGenerator
from typing import Sequence

from fastapi import Depends
from returns.maybe import Maybe, Nothing, Some

from strata_ai.db.engine import get_async_session
from strata_ai.models.user import User
from strata_ai.repos.user_repo import UserRepository


class UserService:
    def __init__(self, repo: UserRepository):
        self._repo = repo

    async def get(self, user_id: uuid.UUID) -> Maybe[User]:
        return await self._repo.get(user_id)

    async def update(self, user_id: uuid.UUID, *, name: str) -> Maybe[User]:
        maybe_user = await self.get(user_id)
        user = maybe_user.value_or(None)
        if user is None:
            return Nothing

        if user.name != name and await self.is_name_taken(name):
            return Nothing

        user.name = name

        await self._repo._session.flush()
        await self._repo._session.refresh(user)
        return Some(user)

    async def set_active(self, user_id: uuid.UUID, is_active: bool) -> Maybe[User]:
        return await self._repo.set_active(user_id, is_active)

    async def activate(self, user_id: uuid.UUID) -> Maybe[User]:
        return await self._repo.activate(user_id)

    async def deactivate(self, user_id: uuid.UUID) -> Maybe[User]:
        return await self._repo.deactivate(user_id)

    async def list(self) -> Sequence[User]:
        return await self._repo.list()

    async def is_name_taken(self, name: str) -> bool:
        return await self._repo.exists_by_name(name)


async def get_user_service(
    repo: UserRepository = Depends(
        lambda session=Depends(get_async_session): UserRepository(session)
    ),
) -> AsyncGenerator[UserService, None]:
    yield UserService(repo)

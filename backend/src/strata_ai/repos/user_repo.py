import uuid
from typing import Optional, Sequence

from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from returns.maybe import Maybe, Nothing, Some
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from strata_ai.models import User
from strata_ai.repos.base_repo import BaseRepository


class UserRepository(BaseRepository):
    def __init__(self, session: AsyncSession):
        self._session = session
        self._impl = SQLAlchemyUserDatabase(session, User)

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        return await self._impl.get(user_id)

    def get_impl(self) -> SQLAlchemyUserDatabase:
        return self._impl

    async def list(self) -> Sequence[User]:
        result = await self._session.execute(select(User))
        return result.scalars().all()

    async def _set_active(self, user_id: uuid.UUID, *, is_active: bool) -> Maybe[User]:
        user = await self.get_by_id(user_id)
        if user is None:
            return Nothing

        user.is_active = is_active
        await self._session.flush()
        await self._session.refresh(user)
        return Some(user)

    async def activate(self, user_id: uuid.UUID) -> Maybe[User]:
        return await self._set_active(user_id, is_active=True)

    async def deactivate(self, user_id: uuid.UUID) -> Maybe[User]:
        return await self._set_active(user_id, is_active=False)
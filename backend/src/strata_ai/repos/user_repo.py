import uuid
from typing import Optional

from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
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

import uuid
from typing import Sequence

from returns.maybe import Maybe, Nothing, Some
from sqlalchemy import select

from strata_ai.models.user import User
from strata_ai.repos.base_repo import BaseRepository


class UserRepository(BaseRepository):
    async def get(self, user_id: uuid.UUID) -> Maybe[User]:
        result = await self._session.execute(select(User).where(User.id == user_id))
        return Maybe.from_optional(result.scalar_one_or_none())

    async def list(self) -> Sequence[User]:
        result = await self._session.execute(select(User))
        return result.scalars().all()

    async def exists_by_name(self, name: str) -> bool:
        result = await self._session.execute(select(User.id).where(User.name == name))
        return result.scalar_one_or_none() is not None

    async def set_active(self, user_id: uuid.UUID, is_active: bool) -> Maybe[User]:
        maybe_user = await self.get(user_id)
        user = maybe_user.value_or(None)
        if user is None:
            return Nothing

        user.is_active = is_active

        await self._session.flush()
        await self._session.refresh(user)
        return Some(user)

    async def activate(self, user_id: uuid.UUID) -> Maybe[User]:
        return await self.set_active(user_id, True)

    async def deactivate(self, user_id: uuid.UUID) -> Maybe[User]:
        return await self.set_active(user_id, False)

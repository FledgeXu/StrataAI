import uuid
from typing import Sequence

from returns.maybe import Maybe, Nothing, Some
from sqlalchemy import select

from strata_ai.models import Organization, OrganizationKind
from strata_ai.repos.base_repo import BaseRepository


class OrganizationRepository(BaseRepository):
    async def add(
        self,
        *,
        name: str,
        kind: OrganizationKind,
        industry: str,
        is_active: bool = True,
    ) -> Organization:
        organization = Organization(
            name=name,
            kind=kind,
            industry=industry,
            is_active=is_active,
        )
        self._session.add(organization)

        await self._session.flush()
        await self._session.refresh(organization)
        return organization

    async def get(self, organization_id: uuid.UUID) -> Maybe[Organization]:
        result = await self._session.execute(
            select(Organization).where(Organization.id == organization_id)
        )
        return Maybe.from_optional(result.scalar_one_or_none())

    async def exists_by_name(self, name: str) -> bool:
        result = await self._session.execute(
            select(Organization.id).where(Organization.name == name)
        )
        return result.scalar_one_or_none() is not None

    async def update(
        self,
        organization_id: uuid.UUID,
        *,
        name: str,
        kind: OrganizationKind,
        industry: str,
    ) -> Maybe[Organization]:
        maybe_organization = await self.get(organization_id)
        organization = maybe_organization.value_or(None)
        if organization is None:
            return Nothing

        organization.name = name
        organization.kind = kind
        organization.industry = industry

        await self._session.flush()
        await self._session.refresh(organization)
        return Some(organization)

    async def set_active(
        self, organization_id: uuid.UUID, is_active: bool
    ) -> Maybe[Organization]:
        maybe_organization = await self.get(organization_id)
        organization = maybe_organization.value_or(None)
        if organization is None:
            return Nothing

        organization.is_active = is_active

        await self._session.flush()
        await self._session.refresh(organization)
        return Some(organization)

    async def activate(self, organization_id: uuid.UUID) -> Maybe[Organization]:
        return await self.set_active(organization_id, True)

    async def deactivate(self, organization_id: uuid.UUID) -> Maybe[Organization]:
        return await self.set_active(organization_id, False)

    async def list(self) -> Sequence[Organization]:
        result = await self._session.execute(select(Organization))
        return result.scalars().all()

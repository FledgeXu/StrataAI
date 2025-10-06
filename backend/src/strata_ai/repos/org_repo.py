import uuid
from typing import Optional

from returns.maybe import Maybe, Nothing
from sqlalchemy import select

from strata_ai.models.organizations import Organization, OrganizationKind
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
        return Maybe(result.scalar_one_or_none())

    async def update(
        self,
        organization_id: uuid.UUID,
        *,
        name: Optional[str] = None,
        kind: Optional[OrganizationKind] = None,
        industry: Optional[str] = None,
    ) -> Maybe[Organization]:
        organization = await self.get(organization_id)
        if organization is None:
            return Nothing

        if name is not None:
            organization.name = name
        if kind is not None:
            organization.kind = kind
        if industry is not None:
            organization.industry = industry

        await self._session.flush()
        await self._session.refresh(organization)
        return Maybe(organization)

    async def set_active(
        self, organization_id: uuid.UUID, is_active: bool
    ) -> Maybe[Organization]:
        organization = await self.get(organization_id)
        if organization is None:
            return Nothing

        organization.is_active = is_active
        await self._session.flush()
        await self._session.refresh(organization)
        return Maybe(organization)

    async def activate(self, organization_id: uuid.UUID) -> Maybe[Organization]:
        return await self.set_active(organization_id, True)

    async def deactivate(self, organization_id: uuid.UUID) -> Maybe[Organization]:
        return await self.set_active(organization_id, False)

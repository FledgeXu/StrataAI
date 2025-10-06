import uuid
from typing import AsyncGenerator, Optional

from fastapi import Depends
from returns.maybe import Maybe

from strata_ai.db.engine import get_async_session
from strata_ai.models.organizations import Organization, OrganizationKind
from strata_ai.repos.org_repo import OrganizationRepository


class OrganizationService:
    def __init__(self, repo: OrganizationRepository):
        self._repo = repo

    async def create(
        self,
        *,
        name: str,
        kind: OrganizationKind,
        industry: str,
        is_active: bool = True,
    ) -> Organization:
        return await self._repo.add(
            name=name,
            kind=kind,
            industry=industry,
            is_active=is_active,
        )

    async def get(self, organization_id: uuid.UUID) -> Maybe[Organization]:
        return await self._repo.get(organization_id)

    async def update(
        self,
        organization_id: uuid.UUID,
        *,
        name: Optional[str] = None,
        kind: Optional[OrganizationKind] = None,
        industry: Optional[str] = None,
    ) -> Maybe[Organization]:
        return await self._repo.update(
            organization_id,
            name=name,
            kind=kind,
            industry=industry,
        )

    async def set_active(
        self, organization_id: uuid.UUID, is_active: bool
    ) -> Maybe[Organization]:
        return await self._repo.set_active(organization_id, is_active)

    async def activate(self, organization_id: uuid.UUID) -> Maybe[Organization]:
        return await self._repo.activate(organization_id)

    async def deactivate(self, organization_id: uuid.UUID) -> Maybe[Organization]:
        return await self._repo.deactivate(organization_id)


async def get_organization_service(
    repo: OrganizationRepository = Depends(
        lambda session=Depends(get_async_session): OrganizationRepository(session)
    ),
) -> AsyncGenerator[OrganizationService, None]:
    yield OrganizationService(repo)

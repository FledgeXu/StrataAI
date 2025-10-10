import uuid
from collections.abc import AsyncGenerator
from typing import Sequence

from fastapi import Depends
from returns.maybe import Maybe, Nothing, Some

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
    ) -> Maybe[Organization]:
        if await self.is_name_taken(name):
            return Nothing
        return Some(
            await self._repo.add(
                name=name,
                kind=kind,
                industry=industry,
                is_active=is_active,
            )
        )

    async def get(self, organization_id: uuid.UUID) -> Maybe[Organization]:
        return await self._repo.get(organization_id)

    async def update(
        self,
        organization_id: uuid.UUID,
        *,
        name: str | None = None,
        kind: OrganizationKind | None = None,
        industry: str | None = None,
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

    async def list(self) -> Sequence[Organization]:
        return await self._repo.list()

    async def is_name_taken(self, name: str) -> bool:
        return await self._repo.exists_by_name(name)


async def get_organization_service(
    repo: OrganizationRepository = Depends(
        lambda session=Depends(get_async_session): OrganizationRepository(session)
    ),
) -> AsyncGenerator[OrganizationService, None]:
    yield OrganizationService(repo)

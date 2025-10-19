import uuid
from collections.abc import AsyncGenerator
from typing import Sequence

from fastapi import Depends
from returns.maybe import Maybe, Nothing, Some

from strata_ai.db.engine import get_async_session
from strata_ai.models import Organization, OrganizationKind
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
        name: str,
        kind: OrganizationKind,
        industry: str,
    ) -> Maybe[Organization]:
        origin = await self.get(organization_id)
        match origin:
            case Nothing.empty:
                return Nothing
            # If the name is different, we must check whether it already exists.
            case Some(org) if org.name != name and await self.is_name_taken(name):
                return Nothing
            # If name is same, we just update it normally.
            case Some(org):
                return await self._repo.update(
                    organization_id,
                    name=name,
                    kind=kind,
                    industry=industry,
                )
            case _:
                return Nothing

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

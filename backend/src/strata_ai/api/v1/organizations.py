import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from returns.maybe import Maybe

from strata_ai.models.organizations import Organization
from strata_ai.schemas.organization import (
    OrganizationCreate,
    OrganizationRead,
    OrganizationUpdate,
)
from strata_ai.services.organization_service import (
    OrganizationService,
    get_organization_service,
)

router = APIRouter(prefix="/organizations", tags=["organizations"])


def _unwrap_organization(maybe_organization: Maybe[Organization]) -> Organization:
    organization = maybe_organization.value_or(None)
    if organization is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found",
        )
    return organization


@router.post(
    "/",
    response_model=OrganizationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_organization(
    payload: OrganizationCreate,
    service: OrganizationService = Depends(get_organization_service),
):
    organization = await service.create(
        name=payload.name,
        kind=payload.kind,
        industry=payload.industry,
        is_active=payload.is_active,
    )
    return organization


@router.get(
    "/{organization_id}",
    response_model=OrganizationRead,
)
async def get_organization(
    organization_id: uuid.UUID,
    service: OrganizationService = Depends(get_organization_service),
):
    return _unwrap_organization(await service.get(organization_id))


@router.patch(
    "/{organization_id}",
    response_model=OrganizationRead,
)
async def update_organization(
    organization_id: uuid.UUID,
    payload: OrganizationUpdate,
    service: OrganizationService = Depends(get_organization_service),
):
    updates = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    return _unwrap_organization(
        await service.update(
            organization_id,
            **updates,
        )
    )


@router.post(
    "/{organization_id}/activate",
    response_model=OrganizationRead,
)
async def activate_organization(
    organization_id: uuid.UUID,
    service: OrganizationService = Depends(get_organization_service),
):
    return _unwrap_organization(await service.activate(organization_id))


@router.post(
    "/{organization_id}/deactivate",
    response_model=OrganizationRead,
)
async def deactivate_organization(
    organization_id: uuid.UUID,
    service: OrganizationService = Depends(get_organization_service),
):
    return _unwrap_organization(await service.deactivate(organization_id))

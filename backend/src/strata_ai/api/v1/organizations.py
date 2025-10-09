import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from returns.maybe import Maybe

from strata_ai.models.organizations import Organization
from strata_ai.schemas.organization import (
    OrganizationCreate,
    OrganizationRead,
    OrganizationUpdate,
)
from strata_ai.schemas.resp import Resp, ok
from strata_ai.services.organization_service import (
    OrganizationService,
    get_organization_service,
)

router = APIRouter(prefix="/organizations", tags=["organizations"])


def _unwrap_organization(
    maybe_organization: Maybe[Organization],
    detail: str = "Organization not found",
    status_code: int = status.HTTP_404_NOT_FOUND,
) -> Organization:
    organization = maybe_organization.value_or(None)
    if organization is None:
        raise HTTPException(status_code=status_code, detail=detail)
    return organization


@router.post(
    "/",
    response_model=Resp[OrganizationRead],
    status_code=status.HTTP_201_CREATED,
)
async def create_organization(
    payload: OrganizationCreate,
    service: OrganizationService = Depends(get_organization_service),
):
    org_result = await service.create(
        name=payload.name,
        kind=payload.kind,
        industry=payload.industry,
        is_active=payload.is_active,
    )
    return ok(
        _unwrap_organization(
            org_result,
            "Organization with the same name already exists",
            status.HTTP_409_CONFLICT,
        )
    )


@router.get(
    "/",
    response_model=Resp[list[OrganizationRead]],
)
async def list_organizations(
    service: OrganizationService = Depends(get_organization_service),
):
    payload = [OrganizationRead.model_validate(org) for org in await service.list()]
    return ok(payload)


@router.get(
    "/{organization_id}",
    response_model=Resp[OrganizationRead],
)
async def get_organization(
    organization_id: uuid.UUID,
    service: OrganizationService = Depends(get_organization_service),
):
    return ok(_unwrap_organization(await service.get(organization_id)))


@router.patch(
    "/{organization_id}",
    response_model=Resp[OrganizationRead],
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

    return ok(
        _unwrap_organization(
            await service.update(
                organization_id,
                **updates,
            )
        )
    )


@router.post(
    "/{organization_id}/activate",
    response_model=Resp[OrganizationRead],
)
async def activate_organization(
    organization_id: uuid.UUID,
    service: OrganizationService = Depends(get_organization_service),
):
    return ok(_unwrap_organization(await service.activate(organization_id)))


@router.post(
    "/{organization_id}/deactivate",
    response_model=Resp[OrganizationRead],
)
async def deactivate_organization(
    organization_id: uuid.UUID,
    service: OrganizationService = Depends(get_organization_service),
):
    return ok(_unwrap_organization(await service.deactivate(organization_id)))

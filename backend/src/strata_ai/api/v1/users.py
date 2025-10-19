import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from returns.maybe import Maybe

from strata_ai.models.user import User
from strata_ai.schemas.resp import Resp, ok
from strata_ai.schemas.user import UserRead
from strata_ai.services.user_service import UserService, get_user_service

router = APIRouter(prefix="/users", tags=["users"])


def _unwrap_user(
    maybe_user: Maybe[User],
    detail: str = "User not found",
    status_code: int = status.HTTP_404_NOT_FOUND,
) -> User:
    user = maybe_user.value_or(None)
    if user is None:
        raise HTTPException(status_code=status_code, detail=detail)
    return user


@router.get(
    "/",
    response_model=Resp[list[UserRead]],
)
async def list_users(service: UserService = Depends(get_user_service)):
    payload = [UserRead.model_validate(user) for user in await service.list()]
    return ok(payload)


@router.get(
    "/{user_id}",
    response_model=Resp[UserRead],
)
async def get_user(
    user_id: uuid.UUID,
    service: UserService = Depends(get_user_service),
):
    return ok(_unwrap_user(await service.get(user_id)))


@router.post(
    "/{user_id}/activate",
    response_model=Resp[UserRead],
)
async def activate_user(
    user_id: uuid.UUID,
    service: UserService = Depends(get_user_service),
):
    return ok(_unwrap_user(await service.activate(user_id)))


@router.post(
    "/{user_id}/deactivate",
    response_model=Resp[UserRead],
)
async def deactivate_user(
    user_id: uuid.UUID,
    service: UserService = Depends(get_user_service),
):
    return ok(_unwrap_user(await service.deactivate(user_id)))

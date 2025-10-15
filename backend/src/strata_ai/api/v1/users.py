import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_users.exceptions import UserAlreadyExists
from returns.maybe import Maybe

from strata_ai.models import User
from strata_ai.schemas.resp import Resp, ok
from strata_ai.schemas.user import UserCreate, UserRead, UserUpdate
from strata_ai.services.user_service import UserService, get_user_manager

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


@router.post(
    "/",
    response_model=Resp[UserRead],
    status_code=status.HTTP_201_CREATED,
)
async def create_user(
    payload: UserCreate,
    service: UserService = Depends(get_user_manager),
):
    if await service.get_by_email(payload.email) is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with the same email already exists",
        )

    try:
        user = await service.create(payload, safe=False)
    except UserAlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with the same email already exists",
        )

    return ok(UserRead.model_validate(user))


@router.get(
    "/",
    response_model=Resp[list[UserRead]],
)
async def list_users(service: UserService = Depends(get_user_manager)):
    payload = [UserRead.model_validate(user) for user in await service.list()]
    return ok(payload)


@router.get(
    "/{user_id}",
    response_model=Resp[UserRead],
)
async def get_user(
    user_id: uuid.UUID,
    service: UserService = Depends(get_user_manager),
):
    return ok(UserRead.model_validate(_unwrap_user(await service.get_maybe(user_id))))


@router.patch(
    "/{user_id}",
    response_model=Resp[UserRead],
)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    service: UserService = Depends(get_user_manager),
):
    updates = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    user = _unwrap_user(await service.get_maybe(user_id))

    next_email = updates.get("email")
    if (
        next_email
        and next_email != user.email
        and await service.get_by_email(next_email) is not None
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with the same email already exists",
        )

    try:
        updated_user = await service.update(payload, user)
    except UserAlreadyExists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with the same email already exists",
        )

    return ok(UserRead.model_validate(updated_user))


@router.post(
    "/{user_id}/activate",
    response_model=Resp[UserRead],
)
async def activate_user(
    user_id: uuid.UUID,
    service: UserService = Depends(get_user_manager),
):
    return ok(UserRead.model_validate(_unwrap_user(await service.activate(user_id))))


@router.post(
    "/{user_id}/deactivate",
    response_model=Resp[UserRead],
)
async def deactivate_user(
    user_id: uuid.UUID,
    service: UserService = Depends(get_user_manager),
):
    return ok(UserRead.model_validate(_unwrap_user(await service.deactivate(user_id))))

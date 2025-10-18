import uuid

from fastapi_users import schemas
from pydantic import ConfigDict
from pydantic.alias_generators import to_camel


class UserRead(schemas.BaseUser[uuid.UUID]):
    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
        alias_generator=to_camel,
        validate_by_name=True,
    )


class UserCreate(schemas.BaseUserCreate):
    model_config = ConfigDict(extra="forbid", alias_generator=to_camel)


class UserUpdate(schemas.BaseUserUpdate):
    model_config = ConfigDict(extra="forbid", alias_generator=to_camel)

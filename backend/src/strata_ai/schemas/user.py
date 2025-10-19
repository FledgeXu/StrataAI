import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class UserRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
        alias_generator=to_camel,
        validate_by_name=True,
    )

    id: uuid.UUID
    name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from strata_ai.models import OrganizationKind


class OrganizationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", alias_generator=to_camel)

    name: str
    kind: OrganizationKind
    industry: str
    is_active: bool = True


class OrganizationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", alias_generator=to_camel)

    name: Optional[str] = None
    kind: Optional[OrganizationKind] = None
    industry: Optional[str] = None


class OrganizationRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="forbid",
        alias_generator=to_camel,
        validate_by_name=True,
    )

    name: str
    kind: OrganizationKind
    industry: str
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from strata_ai.models.organizations import OrganizationKind


class OrganizationCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    kind: OrganizationKind
    industry: str
    is_active: bool = True


class OrganizationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = None
    kind: Optional[OrganizationKind] = None
    industry: Optional[str] = None


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    name: str
    kind: OrganizationKind
    industry: str
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

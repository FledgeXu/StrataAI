from fastapi_users.db import SQLAlchemyBaseUserTableUUID

from strata_ai.models.base import Base


class User(SQLAlchemyBaseUserTableUUID, Base):
    pass

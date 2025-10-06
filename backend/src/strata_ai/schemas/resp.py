from typing import Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class Resp(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True, extra="forbid")
    code: int = 200
    message: str = "OK"
    data: Optional[T] = None


def ok(data: T, message: str = "OK", code: int = 200) -> Resp[T]:
    return Resp[T](code=code, message=message, data=data)


def err(message: str, code: int = 400) -> Resp[None]:
    return Resp[None](code=code, message=message, data=None)

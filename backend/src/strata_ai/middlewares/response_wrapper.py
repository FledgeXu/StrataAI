import orjson
from fastapi import HTTPException, Request
from fastapi.responses import ORJSONResponse
from fastapi.routing import APIRoute

from strata_ai.core.config import Config


async def wrap_response(request: Request, call_next):
    # Filter routers with NO_WRAP_TAG.
    if request.url.path == "/openapi.json":
        return await call_next(request)

    route = request.scope.get("route")
    if isinstance(route, APIRoute) and Config.NO_WRAP_TAG in (route.tags or []):
        return await call_next(request)

    try:
        response = await call_next(request)

        # Determine whether response data is json, although it should be.
        content_type: str | None = response.headers.get("content-type")
        if not content_type or not content_type.startswith("application/json"):
            return response

        chunks = [chunk async for chunk in response.body_iterator]
        body = b"".join(chunks)
        data = orjson.loads(body)
        wrapped = {
            "code": response.status_code,
            "data": data if response.status_code < 400 else None,
            "message": "OK" if response.status_code < 400 else "Error",
        }
        return ORJSONResponse(content=wrapped, status_code=response.status_code)

    except HTTPException as exc:
        return ORJSONResponse(
            status_code=exc.status_code,
            content={
                "code": exc.status_code,
                "data": {},
                "message": exc.detail or exc.__class__.__name__,
            },
        )

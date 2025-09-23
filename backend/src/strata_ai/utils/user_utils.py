from fastapi_users.exceptions import UserAlreadyExists

from strata_ai.db.engine import AsyncSessionLocal
from strata_ai.repos.user_repo import UserRepository
from strata_ai.schemas.user import UserCreate
from strata_ai.services.user_service import UserManager


async def create_user(
    email: str,
    password: str,
    *,
    is_superuser: bool = False,
    is_verified: bool = False,
    is_active: bool = True,
) -> None:
    async with AsyncSessionLocal() as session:
        repo = UserRepository(session)
        manager = UserManager(repo.get_impl())

        try:
            user = await manager.create(
                UserCreate(
                    email=email,
                    password=password,
                    is_active=is_active,
                    is_verified=is_verified,
                    is_superuser=is_superuser,
                ),
                safe=False,
            )
            await session.commit()
            print(f"User created: {user.id} ({user.email})")

        except UserAlreadyExists:
            print(f"User {email} already exists")
        except Exception:
            await session.rollback()
            raise

import { createRootRoute, Outlet } from "@tanstack/react-router";

const RootLayout = () => (
    <div className="h-dvh w-dvw">
        <Outlet />
    </div>
);

export const Route = createRootRoute({ component: RootLayout });

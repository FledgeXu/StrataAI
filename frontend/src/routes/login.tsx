import { createFileRoute } from "@tanstack/react-router";
import LeftSideImage from "/login_page_left_side.jpg";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="h-full overflow-clip grid grid-cols-10 gap-4">
      <img src={LeftSideImage} className="col-span-4" />
      <div>Hello "/login"</div>
    </div>
  );
}

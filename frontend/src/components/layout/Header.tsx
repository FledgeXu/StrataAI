import { User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <div className="w-full h-12 flex justify-between items-center py-3">
      <div className="h-full w-fit flex items-center space-x-1">
        <SidebarTrigger />
        <Separator orientation="vertical" />
        <div className="pl-2">Strata AI</div>
      </div>
      <Button variant={"ghost"} className="size-7">
        <User />
      </Button>
    </div>
  );
}

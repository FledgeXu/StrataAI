import { PanelLeft, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useBoundStore } from "@/stores/useBoundStore";

export function Header() {
    const toggleSidebar = useBoundStore((state) => state.toggleSidebar);
    return (
        <div className="w-full h-14 flex justify-between items-center py-4">
            <div className="h-full w-fit flex items-center space-x-1">
                <Button variant={"ghost"} onClick={toggleSidebar}>
                    <PanelLeft />
                </Button>
                <Separator orientation="vertical" />
                <div className="pl-2">Strata AI</div>
            </div>
            <Button variant={"ghost"}>
                <User />
            </Button>
        </div>
    );
}

import { PanelLeft, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Header() {
    return (
        <div className="bg-amber-100 w-full h-12 flex justify-between items-center-safe p-2">
            <div className="h-full w-fit flex items-center-safe space-x-2">
                <PanelLeft className="col-span-1 col-start-1" />
                <Separator orientation="vertical" className="col-span-1 col-start-2" />
                <div className="col-span-1 col-start-3">Strata AI</div>
            </div>
            <User />
        </div>
    );
}

import { Menu } from "lucide-react";

import NavigationSidebar from "./navigation/NavigationSidebar";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import ServerSidebar from "./server/ServerSidebar";
import { Button } from "./ui/button";


const MobileToggle = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="md:hidden" variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex gap-0 md:hidden">
        <div className="w-[72px]">
          <NavigationSidebar />
        </div>
        <ServerSidebar />
      </SheetContent>
    </Sheet>
  );
};

export default MobileToggle;

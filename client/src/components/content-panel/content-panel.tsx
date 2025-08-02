"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarRail, SidebarHeader, useSidebar } from "@/components/ui/sidebar";

export default function ContentPanel() {
  const { setOpen } = useSidebar();

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <div className="flex justify-between">
          <div />
          <Button variant="ghost" className="cursor-pointer" onClick={() => setOpen(false)}>
            <X />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarRail />
    </Sidebar>
  );
}

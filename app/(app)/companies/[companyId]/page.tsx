"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const WorkspaceIdPage = () => {
  return (
    <div className="w-full h-full flex-1 flex flex-col px-2">
      <div className="border border-muted rounded-lg mx-2 mt-4 z-11 bg-card pb-2">
        <header
          className={cn(
            "z-10 sticky top-0 shrink-0 flex flex-col transition-[width,height] ease-linear",
            "min-h-12",
          )}
        >
          <div className="flex items-center p-2 w-full">
            <div className="flex gap-2">
              <SidebarTrigger className="cursor-pointer" />
              <Breadcrumb className="hidden md:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>Dashboard</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
};

export default WorkspaceIdPage;

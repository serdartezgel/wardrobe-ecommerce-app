import { redirect } from "next/navigation";

import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((mod) => mod.headers()),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const user = session.user;

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <DashboardSidebar
          role={user.role}
          variant="floating"
          className="w-64"
          collapsible="icon"
        />
        <SidebarTrigger className="-mx-2 mt-8 size-8 rounded-l-none border border-l-0" />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="">Header</div>

          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

import { redirect } from "next/navigation";

import DashboardHeader from "@/components/layout/DashboardHeader";
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
      <div className="flex h-screen w-full">
        <DashboardSidebar
          role={user.role}
          variant="floating"
          className="w-64"
          collapsible="icon"
        />
        <SidebarTrigger className="mt-8 size-8 rounded-l-none border border-l-0 md:-mx-2" />

        <div className="flex flex-1 flex-col overflow-y-auto md:px-6">
          <DashboardHeader user={user} />

          <main className="flex-1 py-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;

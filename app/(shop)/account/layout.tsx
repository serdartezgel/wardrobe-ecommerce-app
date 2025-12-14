import { headers } from "next/headers";
import { redirect } from "next/navigation";

import AccountSidebar from "@/components/layout/navigation/AccountSidebar";
import { auth } from "@/lib/auth";

const AccountLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:flex-row md:gap-8">
      <aside className="hidden md:block md:w-64 lg:w-72">
        <AccountSidebar user={session.user} />
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default AccountLayout;

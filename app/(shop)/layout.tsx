import { headers } from "next/headers";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navigation/Navbar";
import { auth } from "@/lib/auth";

const ShopLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log(session, session?.user.role);
  return (
    <div className="flex h-screen w-full flex-col overflow-y-auto">
      <Navbar session={session || null} />

      <main className="container mx-auto flex-1">{children}</main>

      <Footer />
    </div>
  );
};
export default ShopLayout;

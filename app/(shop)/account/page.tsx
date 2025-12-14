import { headers } from "next/headers";

import AccountSettingsForm from "@/components/forms/AccountSettingsForm";
import { auth } from "@/lib/auth";

const AccountPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <AccountSettingsForm user={session.user} />
    </div>
  );
};

export default AccountPage;

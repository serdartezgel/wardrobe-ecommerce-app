import { MailIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/utils/encryption";

const VerifyEmailPage = async ({ searchParams }: RouteParams) => {
  const { token } = await searchParams;

  if (!token) redirect("/");

  let email = "";
  try {
    email = decrypt(token);
  } catch {
    return redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, emailVerified: true },
  });

  if (!user) redirect("/");
  if (user.emailVerified) redirect("/");

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-2 text-center">
        <MailIcon className="text-primary mx-auto h-10 w-10" />

        <CardTitle className="font-serif text-3xl font-bold">
          Check your inbox
        </CardTitle>

        <CardDescription className="text-muted-foreground">
          We sent a verification link to your email. Please verify your account
          to continue.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-4 flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-center text-sm">
          Didn’t receive the email? You may request another below.
        </p>

        <Button variant="outline" className="cursor-pointer">
          Resend Verification Email
        </Button>
      </CardContent>
    </Card>
  );
};

export default VerifyEmailPage;

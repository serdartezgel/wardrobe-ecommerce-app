"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { encrypt } from "@/lib/utils/encryption";
import { SignInInput, SignInSchema } from "@/lib/validations/auth.validation";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

const SignInForm = () => {
  const router = useRouter();

  const form = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: SignInInput) => {
    try {
      const response = await signIn.email(data, {
        onError: (ctx) => {
          if (ctx.error.status === 403) {
            router.push(`/verify-email?token=${encrypt(data.email)}`);
          }
        },
      });

      if (response.error) throw new Error(response.error.message);

      toast.success("Sign in successfull", {
        description: "Welcome to Wardrobe",
      });

      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Sign in failed", {
          description: error.message || "Failed to sign in",
        });
      } else {
        toast.error("Sign in failed", {
          description: "Failed to sign in",
        });
      }
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <Card className="w-full sm:max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-3xl font-bold tracking-tight">
            Welcome back!
          </CardTitle>
          <Link
            href="/"
            className="text-primary inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
          >
            <ArrowLeftIcon className="size-4" />
            Go back home
          </Link>
        </div>
        <CardDescription className="text-muted-foreground">
          Sign in to your account to continue shopping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-sign-in" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-in-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="form-sign-in-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="example@mail.com"
                    autoComplete="off"
                    className="no-focus"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-in-password">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-sign-in-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="********"
                    autoComplete="off"
                    className="no-focus"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          type="submit"
          form="form-sign-in"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { signUp } from "@/lib/auth-client";
import { encrypt } from "@/lib/utils/encryption";
import { SignUpInput, SignUpSchema } from "@/lib/validations/auth.validation";

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

const SignUpForm = () => {
  const router = useRouter();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: SignUpInput) => {
    try {
      const response = await signUp.email(data);

      if (response.error) throw new Error(response.error.message);

      toast.success("Account created successfully!", {
        description: "Welcome to Wardrobe",
      });

      router.push(`/verify-email?token=${encrypt(data.email)}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Sign up failed", {
          description: error.message || "Failed to create account",
        });
      } else {
        toast.error("Sign up failed", {
          description: "Failed to create account",
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
            Create an account
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
          Join our family and start shopping today
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="form-sign-up" onSubmit={form.handleSubmit(handleSubmit)}>
          <FieldGroup>
            {/* Name Field */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-up-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="form-sign-up-name"
                    type="text"
                    placeholder="John Doe"
                    autoComplete="off"
                    className="no-focus"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Email Field */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-up-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="form-sign-up-email"
                    type="email"
                    placeholder="example@mail.com"
                    autoComplete="off"
                    className="no-focus"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Password Field */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-up-password">
                    Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-sign-up-password"
                    type="password"
                    placeholder="********"
                    autoComplete="off"
                    className="no-focus"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Confirm Password Field */}
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-up-confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-sign-up-confirm-password"
                    type="password"
                    placeholder="********"
                    autoComplete="off"
                    className="no-focus"
                    aria-invalid={fieldState.invalid}
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

      <CardFooter className="flex flex-col gap-8">
        <Button
          type="submit"
          form="form-sign-up"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Sign up"
          )}
        </Button>

        <p className="w-full text-start text-sm font-medium">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

        <p className="text-muted-foreground text-start text-sm">
          By creating a user account, you confirm that you have read,
          understood, and agreed to the{" "}
          <Link
            href="/terms"
            className="text-primary font-medium hover:underline"
          >
            Terms of Use
          </Link>
          , and acknowledge that you have read the{" "}
          <Link
            href="/privacy"
            className="text-primary font-medium hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;

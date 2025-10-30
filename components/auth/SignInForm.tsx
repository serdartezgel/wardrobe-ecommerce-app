"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
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
      const response = await signIn.email(data);

      if (response.error) throw new Error(response.error.message);

      toast.success("Account created successfully!", {
        description: "Welcome to Wardrobe",
      });

      router.push("/");
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
        <CardTitle className="font-serif text-3xl font-bold tracking-tight">
          Welcome back!
        </CardTitle>
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

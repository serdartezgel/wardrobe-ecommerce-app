"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateAddress, createAddress } from "@/lib/actions/address.action";
import {
  AddressInput,
  addressSchema,
} from "@/lib/validations/address.validation";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

const AddressForm = ({
  address,
  onSuccess,
}: {
  address?: AddressInput;
  onSuccess?: () => void;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      isDefault: false,
    },
  });

  const handleSubmit = async (data: AddressInput) => {
    startTransition(async () => {
      if (address) {
        const result = await updateAddress({
          id: address.id as string,
          ...data,
        });

        if (result.success) {
          toast.success("Success", {
            description: "Address updated successfully.",
          });
          router.refresh();
          onSuccess?.();
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong.",
          });
        }
      } else {
        const result = await createAddress(data);

        if (result.success) {
          toast.success("Success", {
            description: "Address created successfully.",
          });
          router.refresh();
          onSuccess?.();
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong.",
          });
        }
      }
    });
  };

  const { isSubmitting } = form.formState;

  return (
    <form
      id="form-address"
      onSubmit={form.handleSubmit(handleSubmit)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
          e.preventDefault();
        }
      }}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <Controller
          name="fullName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-address-fullName">
                Full Name *
              </FieldLabel>
              <Input
                {...field}
                id="form-address-fullName"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="John Doe"
                autoComplete="name"
                className="no-focus"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-address-phone">
                Phone Number *
              </FieldLabel>
              <Input
                {...field}
                id="form-address-phone"
                type="tel"
                aria-invalid={fieldState.invalid}
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
                className="no-focus"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="addressLine1"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-address-addressLine1">
                Address Line 1 *
              </FieldLabel>
              <Input
                {...field}
                id="form-address-addressLine1"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="123 Main Street"
                autoComplete="address-line1"
                className="no-focus"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="addressLine2"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-address-addressLine2">
                Address Line 2
              </FieldLabel>
              <Input
                {...field}
                value={field.value ?? ""}
                id="form-address-addressLine2"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="Apartment, suite, etc. (optional)"
                autoComplete="address-line2"
                className="no-focus"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-address-city">City *</FieldLabel>
                <Input
                  {...field}
                  id="form-address-city"
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="New York"
                  autoComplete="address-level2"
                  className="no-focus"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="state"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-address-state">State *</FieldLabel>
                <Input
                  {...field}
                  id="form-address-state"
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="NY"
                  autoComplete="address-level1"
                  className="no-focus"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="zipCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-address-zipCode">
                  Zip Code *
                </FieldLabel>
                <Input
                  {...field}
                  id="form-address-zipCode"
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="10001"
                  autoComplete="postal-code"
                  className="no-focus"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="country"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-address-country">
                  Country *
                </FieldLabel>
                <Input
                  {...field}
                  id="form-address-country"
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="US"
                  autoComplete="country"
                  className="no-focus"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="isDefault"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-1 flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="form-address-isDefault"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  className="size-6"
                />
                <FieldLabel htmlFor="form-address-isDefault">
                  Set as default address
                </FieldLabel>
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        form="form-address"
        disabled={isSubmitting || isPending}
        className="w-full"
      >
        {isSubmitting || isPending ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : address ? (
          "Update Address"
        ) : (
          "Add Address"
        )}
      </Button>
    </form>
  );
};

export default AddressForm;

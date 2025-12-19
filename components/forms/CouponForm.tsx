"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createCoupon, updateCoupon } from "@/lib/actions/coupon.action";
import { formatPriceNumber, toCents } from "@/lib/utils/price";
import { CouponInput, couponSchema } from "@/lib/validations/coupon.validation";
import { CollectionWithCount } from "@/types/prisma";

import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import {
  MultiSelect,
  MultiSelectTrigger,
  MultiSelectValue,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
} from "../ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CouponFormProps {
  initialData?: Partial<CouponInput>;
  isEditing?: boolean;
  collections: CollectionWithCount[];
}

const CouponForm = ({
  initialData,
  isEditing = false,
  collections,
}: CouponFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          valueCents: initialData.valueCents
            ? initialData.type === "FIXED_AMOUNT"
              ? Number(formatPriceNumber(initialData.valueCents))
              : initialData.valueCents
            : undefined,
          minPurchaseCents: initialData.minPurchaseCents
            ? Number(formatPriceNumber(initialData.minPurchaseCents))
            : undefined,
          maxDiscountCents: initialData.minPurchaseCents
            ? Number(formatPriceNumber(initialData.minPurchaseCents))
            : undefined,
        }
      : {
          code: "",
          type: "PERCENTAGE",
          valueCents: undefined,
          minPurchaseCents: undefined,
          maxDiscountCents: undefined,
          usageLimit: undefined,
          validFrom: "",
          validUntil: "",
          isActive: true,
          collectionIds: [],
        },
  });

  const watchType = form.watch("type");

  const handleSubmit = async (data: CouponInput) => {
    startTransition(async () => {
      const processedData = {
        ...data,
        valueCents:
          data.type === "PERCENTAGE"
            ? data.valueCents
            : toCents(data.valueCents),
        minPurchaseCents: data.minPurchaseCents
          ? toCents(data.minPurchaseCents)
          : undefined,
        maxDiscountCents: data.maxDiscountCents
          ? toCents(data.maxDiscountCents)
          : undefined,
      };

      if (isEditing && initialData?.id) {
        const result = await updateCoupon({
          ...processedData,
          id: initialData.id,
        });

        if (result.success) {
          toast.success("Coupon updated successfully");
          router.push("/dashboard/deals-coupons?tab=coupons");
        } else {
          toast.error(result.error?.message || "Failed to update coupon");
        }
      } else {
        const result = await createCoupon(processedData);

        if (result.success) {
          toast.success("Coupon created successfully");
          router.push("/dashboard/deals-coupons?tab=coupons");
        } else {
          toast.error(result.error?.message || "Failed to create coupon");
        }
      }
    });
  };

  const { isSubmitting } = form.formState;

  return (
    <form
      id="form-coupon"
      onSubmit={form.handleSubmit(handleSubmit)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
          e.preventDefault();
        }
      }}
      className="flex w-full flex-col gap-6"
    >
      <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-xl font-bold">Coupon Details</h2>

        <FieldGroup>
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Coupon Code *</FieldLabel>
                <Input
                  {...field}
                  placeholder="SAVE20"
                  autoComplete="off"
                  className="no-focus font-mono uppercase"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
                <FieldDescription>
                  Must be at least 3 characters, uppercase letters and numbers
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Discount Type *</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="no-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="valueCents"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Discount Value *</FieldLabel>
                <div className="relative">
                  {watchType === "FIXED_AMOUNT" && (
                    <span className="absolute top-1/2 left-3 -translate-y-1/2">
                      $
                    </span>
                  )}
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={watchType === "PERCENTAGE" ? "20" : "10.00"}
                    className={`no-focus pl-8`}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {watchType === "PERCENTAGE" && (
                    <span className="absolute top-1/2 left-3 -translate-y-1/2">
                      %
                    </span>
                  )}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-xl font-bold">Conditions</h2>

        <FieldGroup>
          <Controller
            name="minPurchaseCents"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Minimum Purchase Amount (Optional)</FieldLabel>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2">
                    $
                  </span>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50.00"
                    className="no-focus pl-8"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="maxDiscountCents"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Maximum Discount Cap (Optional)</FieldLabel>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2">
                    $
                  </span>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="100.00"
                    className="no-focus pl-8"
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  />
                </div>
                <FieldDescription>
                  For percentage coupons, limit the maximum discount amount
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="usageLimit"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Usage Limit (Optional)</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="100"
                  className="no-focus"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
                <FieldDescription>
                  Maximum number of times this coupon can be used
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-xl font-bold">Collections (Optional)</h2>
        <p className="text-muted-foreground text-sm">
          Restrict this coupon to specific collections
        </p>

        <div className="bg-muted/50 rounded-md border-2 border-dashed p-4 text-center">
          <Controller
            name="collectionIds"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Collections</FieldLabel>
                <MultiSelect
                  values={field.value}
                  onValuesChange={field.onChange}
                >
                  <MultiSelectTrigger>
                    <MultiSelectValue placeholder="Select collections..." />
                  </MultiSelectTrigger>
                  <MultiSelectContent
                    search={{
                      emptyMessage: "No collection found",
                      placeholder: "Search collections...",
                    }}
                  >
                    <MultiSelectGroup>
                      {collections.map((c) => (
                        <MultiSelectItem key={c.id} value={c.id}>
                          {c.name} ({c._count.products})
                        </MultiSelectItem>
                      ))}
                    </MultiSelectGroup>
                  </MultiSelectContent>
                </MultiSelect>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </div>

      <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-xl font-bold">Validity Period</h2>

        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="validFrom"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Valid From *</FieldLabel>
                  <Input {...field} type="date" className="no-focus" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="validUntil"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Valid Until *</FieldLabel>
                  <Input {...field} type="date" className="no-focus" />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="isActive"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="size-6"
                  />
                  <FieldLabel>Active</FieldLabel>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || isPending}
        className="w-full"
      >
        {isSubmitting || isPending ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : isEditing ? (
          "Update Coupon"
        ) : (
          "Create Coupon"
        )}
      </Button>
    </form>
  );
};

export default CouponForm;

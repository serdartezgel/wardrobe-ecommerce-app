"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createPromotion,
  updatePromotion,
} from "@/lib/actions/promotion.action";
import { formatPriceNumber, toCents } from "@/lib/utils/price";
import {
  PromotionInput,
  promotionSchema,
} from "@/lib/validations/promotion.validation";
import {
  BrandWithRelations,
  CategoryWithChildren,
  CollectionWithCount,
  ProductWithRelations,
} from "@/types/prisma";

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
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "../ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface PromotionFormProps {
  initialData?: Partial<PromotionInput>;
  isEditing?: boolean;
  categories: CategoryWithChildren[];
  brands: BrandWithRelations[];
  products: ProductWithRelations[];
  collections: CollectionWithCount[];
}

const PromotionForm = ({
  initialData,
  isEditing = false,
  categories,
  brands,
  products,
  collections,
}: PromotionFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<PromotionInput>({
    resolver: zodResolver(promotionSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          discountValueCents: initialData.discountValueCents
            ? Number(formatPriceNumber(initialData.discountValueCents))
            : undefined,
          minPurchaseCents: initialData.minPurchaseCents
            ? Number(formatPriceNumber(initialData.minPurchaseCents))
            : undefined,
          maxDiscountCents: initialData.maxDiscountCents
            ? Number(formatPriceNumber(initialData.maxDiscountCents))
            : undefined,
        }
      : {
          name: "",
          code: "",
          type: "PRODUCT_DISCOUNT",
          discountType: "PERCENTAGE",
          discountValueCents: undefined,
          minPurchaseCents: undefined,
          minQuantity: undefined,
          maxDiscountCents: undefined,
          bogoConfig: "",
          usageLimit: undefined,
          usagePerCustomer: undefined,
          validFrom: "",
          validUntil: "",
          isActive: true,
          applyToAllProducts: false,
          excludeSaleItems: false,
          categoryIds: [],
          brandIds: [],
          productIds: [],
          collectionIds: [],
        },
  });

  const watchType = form.watch("type");
  const watchApplyToAll = form.watch("applyToAllProducts");

  const handleSubmit = async (data: PromotionInput) => {
    startTransition(async () => {
      const processedData = {
        ...data,
        discountValueCents: data.discountValueCents
          ? data.discountType === "PERCENTAGE"
            ? data.discountValueCents
            : toCents(data.discountValueCents)
          : undefined,
        minPurchaseCents: data.minPurchaseCents
          ? toCents(data.minPurchaseCents)
          : undefined,
        maxDiscountCents: data.maxDiscountCents
          ? toCents(data.maxDiscountCents)
          : undefined,
      };

      if (isEditing && initialData?.id) {
        const result = await updatePromotion({
          ...processedData,
          id: initialData.id,
        });

        if (result.success) {
          toast.success("Promotion updated successfully");
          router.push("/dashboard/deals-coupons?tab=promotions");
        } else {
          toast.error(result.error?.message || "Failed to update promotion");
        }
      } else {
        const result = await createPromotion(processedData);

        if (result.success) {
          toast.success("Promotion created successfully");
          router.push("/dashboard/deals-coupons?tab=promotions");
        } else {
          toast.error(result.error?.message || "Failed to create promotion");
        }
      }
    });
  };

  const { isSubmitting } = form.formState;

  return (
    <form
      id="form-promotion"
      onSubmit={form.handleSubmit(handleSubmit)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
          e.preventDefault();
        }
      }}
      className="flex w-full flex-col gap-6"
    >
      <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-xl font-bold">Basic Information</h2>

        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Promotion Name *</FieldLabel>
                <Input
                  {...field}
                  placeholder="Summer Sale 2024"
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
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Promo Code (Optional)</FieldLabel>
                <Input
                  {...field}
                  placeholder="SUMMER2024"
                  autoComplete="off"
                  className="no-focus uppercase"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
                <FieldDescription>
                  Leave empty for automatic promotions
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
                <FieldLabel>Promotion Type *</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="no-focus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCT_DISCOUNT">
                      Product Discount
                    </SelectItem>
                    <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    <SelectItem value="BOGO">Buy One Get One</SelectItem>
                    <SelectItem value="BUNDLE">Bundle Discount</SelectItem>
                    <SelectItem value="CART_DISCOUNT">Cart Discount</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      {watchType !== "FREE_SHIPPING" && watchType !== "BOGO" && (
        <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
          <h2 className="text-xl font-bold">Discount Configuration</h2>

          <FieldGroup>
            <Controller
              name="discountType"
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
              name="discountValueCents"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Discount Value *</FieldLabel>
                  <div className="relative">
                    {form.watch("discountType") === "FIXED_AMOUNT" && (
                      <span className="absolute top-1/2 left-3 -translate-y-1/2">
                        $
                      </span>
                    )}
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={
                        form.watch("discountType") === "PERCENTAGE"
                          ? "10"
                          : "10.00"
                      }
                      className={`no-focus pl-8`}
                      value={field.value ? field.value.toFixed(2) : ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    {form.watch("discountType") === "PERCENTAGE" && (
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
                      value={field.value ? field.value.toFixed(2) : ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                    />
                  </div>
                  <FieldDescription>
                    Maximum discount amount for percentage-based promotions
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </div>
      )}

      {watchType === "BOGO" && (
        <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
          <h2 className="text-xl font-bold">BOGO Configuration</h2>

          <FieldGroup>
            <Controller
              name="bogoConfig"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>BOGO Rules (JSON)</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder='{"buy": 2, "get": 1, "discountPercent": 100}'
                    rows={4}
                    className="no-focus font-mono text-sm"
                  />
                  <FieldDescription>
                    Example: Buy 2, Get 1 at 100% off (free)
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </div>
      )}

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
                    value={field.value ? field.value.toFixed(2) : ""}
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
            name="minQuantity"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Minimum Quantity (Optional)</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="2"
                  className="no-focus"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="excludeSaleItems"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="size-6"
                  />
                  <FieldLabel>Exclude Sale Items</FieldLabel>
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
        <h2 className="text-xl font-bold">Applicability</h2>

        <FieldGroup>
          <Controller
            name="applyToAllProducts"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        form.setValue("categoryIds", []);
                        form.setValue("brandIds", []);
                        form.setValue("productIds", []);
                        form.setValue("collectionIds", []);
                      }
                    }}
                    className="size-6"
                  />
                  <FieldLabel>Apply to All Products</FieldLabel>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {!watchApplyToAll && (
            <div className="space-y-4 border-t pt-4">
              <p className="text-muted-foreground text-sm">
                Select specific categories, brands, products, or collections to
                apply this promotion to.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <Controller
                  name="categoryIds"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Categories</FieldLabel>
                      <MultiSelect
                        values={field.value ?? []}
                        onValuesChange={field.onChange}
                      >
                        <MultiSelectTrigger>
                          <MultiSelectValue placeholder="Select categories..." />
                        </MultiSelectTrigger>
                        <MultiSelectContent
                          search={{
                            emptyMessage: "No category found",
                            placeholder: "Search categories...",
                          }}
                        >
                          <MultiSelectGroup>
                            {categories.map((cat) => (
                              <MultiSelectGroup key={cat.id}>
                                <MultiSelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </MultiSelectItem>
                                {cat.children.length > 0 &&
                                  cat.children.map((child) => (
                                    <MultiSelectGroup key={child.id}>
                                      <MultiSelectItem
                                        key={child.id}
                                        value={child.id}
                                        className="ml-2"
                                      >
                                        {child.name}
                                      </MultiSelectItem>
                                      {child.children.length &&
                                        child.children.map((c) => (
                                          <MultiSelectGroup key={c.id}>
                                            <MultiSelectItem
                                              key={c.id}
                                              value={c.id}
                                              className="ml-5"
                                            >
                                              {c.name}
                                            </MultiSelectItem>
                                          </MultiSelectGroup>
                                        ))}
                                    </MultiSelectGroup>
                                  ))}
                              </MultiSelectGroup>
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

                <Controller
                  name="brandIds"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Brands</FieldLabel>
                      <MultiSelect
                        values={field.value ?? []}
                        onValuesChange={field.onChange}
                      >
                        <MultiSelectTrigger>
                          <MultiSelectValue placeholder="Select brands..." />
                        </MultiSelectTrigger>
                        <MultiSelectContent
                          search={{
                            emptyMessage: "No brand found",
                            placeholder: "Search brands...",
                          }}
                        >
                          <MultiSelectGroup>
                            {brands.map((b) => (
                              <MultiSelectItem key={b.id} value={b.id}>
                                {b.name}
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

                <Controller
                  name="productIds"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Products</FieldLabel>
                      <MultiSelect
                        values={field.value ?? []}
                        onValuesChange={field.onChange}
                      >
                        <MultiSelectTrigger>
                          <MultiSelectValue placeholder="Select products..." />
                        </MultiSelectTrigger>
                        <MultiSelectContent
                          search={{
                            emptyMessage: "No product found",
                            placeholder: "Search products...",
                          }}
                        >
                          <MultiSelectGroup>
                            {products.map((p) => (
                              <MultiSelectItem key={p.id} value={p.id}>
                                <Image
                                  src={p.images[0].url}
                                  alt={p.name}
                                  width={32}
                                  height={32}
                                />
                                {p.name}
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

                <Controller
                  name="collectionIds"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Collections</FieldLabel>
                      <MultiSelect
                        values={field.value ?? []}
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
          )}
        </FieldGroup>
      </div>

      <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-xl font-bold">Usage Limits</h2>

        <FieldGroup>
          <Controller
            name="usageLimit"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Total Usage Limit (Optional)</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="1000"
                  className="no-focus"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
                <FieldDescription>
                  Maximum number of times this promotion can be used
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="usagePerCustomer"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Per Customer Limit (Optional)</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  placeholder="1"
                  className="no-focus"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
                <FieldDescription>Maximum uses per customer</FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
        <h2 className="text-xl font-bold">Scheduling</h2>

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
          "Update Promotion"
        ) : (
          "Create Promotion"
        )}
      </Button>
    </form>
  );
};

export default PromotionForm;

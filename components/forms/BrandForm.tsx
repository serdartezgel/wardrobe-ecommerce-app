"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createBrand, updateBrand } from "@/lib/actions/brand.action";
import { BrandInput, brandSchema } from "@/lib/validations/brand.validation";

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
import { Textarea } from "../ui/textarea";

interface BrandFormProps {
  initialData?: Partial<BrandInput>;
  isEditing?: boolean;
}

const BrandForm = ({ initialData, isEditing }: BrandFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<BrandInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      logo: null,
      isActive: true,
    },
  });

  const handleSubmit = async (data: BrandInput) => {
    startTransition(async () => {
      if (isEditing && initialData) {
        const result = await updateBrand({
          id: data.id,
          ...data,
        });
        if (result.success) {
          toast.success("Success", {
            description: "Brand updated successfully.",
          });
          if (result.data) router.push("/dashboard/brands");
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong.",
          });
        }
        return;
      }

      const result = await createBrand(data);

      if (result.success) {
        toast.success("Success", {
          description: "Brand created successfully.",
        });

        router.push("/dashboard/brands");
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong.",
        });
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      form.setValue("logo", reader.result as string, { shouldValidate: true });
    };

    reader.readAsDataURL(file);
  };

  const { isSubmitting } = form.formState;

  return (
    <form
      id="form-brand"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-brand-name">Brand Name *</FieldLabel>
              <Input
                {...field}
                id="form-brand-name"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="Brand Name"
                autoComplete="off"
                className="no-focus"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-brand-description">
                Brand Description
              </FieldLabel>
              <Textarea
                {...field}
                id="form-brand-description"
                aria-invalid={fieldState.invalid}
                placeholder="Brand description (max 160 characters)"
                maxLength={160}
                rows={5}
                autoComplete="off"
                className="no-focus"
              />
              <FieldDescription>
                {field.value?.length || 0}/160 characters
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex items-start gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Logo
            </Button>

            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {form.formState.errors.logo && (
              <FieldError errors={[form.formState.errors.logo]} />
            )}
          </div>

          {form.watch("logo") && (
            <div className="group relative w-fit">
              <Image
                src={form.watch("logo")!}
                alt={form.getValues("name")}
                width={160}
                height={160}
                className="h-40 rounded-lg border object-cover"
              />

              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  onClick={() =>
                    form.setValue("logo", null, { shouldValidate: true })
                  }
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Controller
          name="isActive"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-1 flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="form-brand-isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  className="size-6"
                />
                <FieldLabel htmlFor="form-brand-isActive">
                  Activate Brand
                </FieldLabel>
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        form="form-brand"
        disabled={isSubmitting || isPending}
        className="flex-1"
      >
        {isSubmitting || isPending ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : isEditing ? (
          "Update Brand"
        ) : (
          "Create Brand"
        )}
      </Button>
    </form>
  );
};

export default BrandForm;

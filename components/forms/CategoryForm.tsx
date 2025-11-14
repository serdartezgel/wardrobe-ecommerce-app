"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";

import {
  CategoryInput,
  categorySchema,
} from "@/lib/validations/category.validation";

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

interface CategoryFormProps {
  initialData?: Partial<CategoryInput>;
  parentId?: string;
  isEditing?: boolean;
}

const CategoryForm = ({
  initialData,
  parentId,
  isEditing,
}: CategoryFormProps) => {
  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      description: undefined,
      image: undefined,
      isActive: true,
      order: 0,
      parentId: null,
      metaTitle: "",
      metaDescription: "",
    },
  });

  const handleSubmit = async (data: CategoryInput) => {
    if (parentId) {
      console.log("Creating a new sub category");
    }
    console.log("Submitting:", { ...data });
    // Call your server action here
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      form.setValue("image", reader.result as string, { shouldValidate: true });
    };

    reader.readAsDataURL(file);
  };

  const { isSubmitting } = form.formState;
  return (
    <form
      id="form-category"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-category-name">
                Category Name *
              </FieldLabel>
              <Input
                {...field}
                id="form-category-name"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="Category Name"
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
              <FieldLabel htmlFor="form-category-description">
                Category Description
              </FieldLabel>
              <Textarea
                {...field}
                id="form-category-description"
                aria-invalid={fieldState.invalid}
                placeholder="Category description (max 160 characters)"
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
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Image
            </Button>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {form.formState.errors.image && (
            <FieldError errors={[form.formState.errors.image]} />
          )}

          {form.watch("image") && (
            <div className="group relative w-fit">
              <Image
                src={form.watch("image")!}
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
                    form.setValue("image", undefined, { shouldValidate: true })
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
                  id="form-category-isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                  className="size-6"
                />
                <FieldLabel htmlFor="form-category-isActive">
                  Activate Category
                </FieldLabel>
              </div>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="metaTitle"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-product-metaTitle">
                Meta Title
              </FieldLabel>
              <Input
                {...field}
                id="form-product-metaTitle"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="SEO-friendly title (max 60 characters)"
                autoComplete="off"
                className="no-focus"
              />
              <FieldDescription>
                {field.value?.length || 0}/60 characters
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="metaDescription"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-product-metaDescription">
                Meta Description
              </FieldLabel>
              <Textarea
                {...field}
                id="form-product-metaDescription"
                aria-invalid={fieldState.invalid}
                placeholder="SEO description (max 160 characters)"
                maxLength={160}
                rows={3}
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
      </FieldGroup>

      <Button
        type="submit"
        form="form-category"
        disabled={isSubmitting}
        className="flex-1"
      >
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : isEditing ? (
          "Update Category"
        ) : (
          "Create Category"
        )}
      </Button>
    </form>
  );
};

export default CategoryForm;

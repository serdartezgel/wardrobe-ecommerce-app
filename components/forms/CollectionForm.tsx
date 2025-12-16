"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UploadIcon, Trash2Icon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  updateCollection,
  createCollection,
} from "@/lib/actions/collection.action";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "@/lib/actions/image.action";
import logger from "@/lib/logger";
import { extractPublicIdFromUrl } from "@/lib/utils/image";
import { generateSlug } from "@/lib/utils/slug";
import {
  CollectionInput,
  collectionSchema,
} from "@/lib/validations/collection.validation";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface CollectionFormProps {
  initialData?: CollectionInput;
  isEditing?: boolean;
}

const CollectionForm = ({ initialData, isEditing }: CollectionFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CollectionInput>({
    resolver: zodResolver(collectionSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      image: "",
      type: "MANUAL",
      isActive: true,
      isFeatured: false,
      order: 0,
      rules: "",
      metaTitle: "",
      metaDescription: "",
      publishedAt: "",
      validFrom: "",
      validUntil: "",
    },
  });

  const handleSubmit = async (data: CollectionInput) => {
    startTransition(async () => {
      if (isEditing && initialData?.id) {
        const result = await updateCollection({
          id: initialData.id,
          ...data,
        });

        if (result.success) {
          toast.success("Success", {
            description: "Collection updated successfully.",
          });
          router.push("/dashboard/collections");
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong.",
          });
        }
      } else {
        const result = await createCollection(data);

        if (result.success) {
          toast.success("Success", {
            description: "Collection created successfully.",
          });
          router.push("/dashboard/collections");
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong.",
          });
        }
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const result = await uploadToCloudinary({
        file: base64,
        folder: "collections",
      });

      if (!result.success || !result.data) {
        throw new Error(result.error?.message);
      }

      form.setValue("image", result.data.url, {
        shouldDirty: true,
        shouldValidate: true,
      });

      toast.success("Image uploaded successfully");
    } catch (error) {
      logger.error(`Upload error: ${error}`);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    const imageUrl = form.getValues("image");
    let publicId;
    if (imageUrl) publicId = extractPublicIdFromUrl(imageUrl);

    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    form.setValue("image", undefined, { shouldDirty: true });

    toast.success("Collection image deleted");
  };

  const { isSubmitting } = form.formState;

  return (
    <form
      id="form-collection"
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
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-collection-name">
                Collection Name *
              </FieldLabel>
              <Input
                {...field}
                id="form-collection-name"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="Summer Collection"
                autoComplete="off"
                className="no-focus"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex gap-2">
          <Controller
            name="slug"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="flex-1">
                <FieldLabel htmlFor="form-collection-slug">Slug *</FieldLabel>
                <Input
                  {...field}
                  id="form-collection-slug"
                  type="text"
                  aria-invalid={fieldState.invalid}
                  placeholder="summer-collection"
                  autoComplete="off"
                  className="no-focus"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const slug = generateSlug(form.getValues("name"));
              form.setValue("slug", slug, { shouldValidate: true });
            }}
            className="mt-8"
          >
            Generate
          </Button>
        </div>

        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-collection-type">
                Collection Type *
              </FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="form-collection-type" className="no-focus">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Manual</SelectItem>
                  <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                  <SelectItem value="SEASONAL">Seasonal</SelectItem>
                  <SelectItem value="DEAL">Deal</SelectItem>
                  <SelectItem value="NEW_ARRIVAL">New Arrival</SelectItem>
                  <SelectItem value="BESTSELLER">Bestseller</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-collection-description">
                Description
              </FieldLabel>
              <Textarea
                {...field}
                id="form-collection-description"
                aria-invalid={fieldState.invalid}
                placeholder="Collection description"
                rows={4}
                autoComplete="off"
                className="no-focus"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isPending || isUploading}
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <UploadIcon className="mr-2 size-4" />
              Upload Image
            </Button>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {form.formState.errors.image && (
              <FieldError errors={[form.formState.errors.image]} />
            )}
          </div>

          {form.watch("image") && (
            <div className="group relative w-fit">
              <Image
                src={form.watch("image")!}
                alt={form.getValues("name")}
                width={160}
                height={160}
                className="h-40 rounded-lg border object-cover"
              />

              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-8"
                  disabled={isSubmitting || isPending || isUploading}
                  onClick={handleRemoveImage}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Controller
          name="order"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-collection-order">
                Display Order
              </FieldLabel>
              <Input
                {...field}
                id="form-collection-order"
                type="number"
                aria-invalid={fieldState.invalid}
                placeholder="0"
                onChange={(e) => field.onChange(Number(e.target.value))}
                autoComplete="off"
                className="no-focus"
              />
              <FieldDescription>Lower numbers appear first</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex gap-4">
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
                    id="form-collection-isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="size-6"
                  />
                  <FieldLabel htmlFor="form-collection-isActive">
                    Make Active
                  </FieldLabel>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="isFeatured"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="flex flex-1 flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="form-collection-isFeatured"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="size-6"
                  />
                  <FieldLabel htmlFor="form-collection-isFeatured">
                    Make Featured
                  </FieldLabel>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="metaTitle"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-collection-metaTitle">
                Meta Title
              </FieldLabel>
              <Input
                {...field}
                id="form-collection-metaTitle"
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
              <FieldLabel htmlFor="form-collection-metaDescription">
                Meta Description
              </FieldLabel>
              <Textarea
                {...field}
                id="form-collection-metaDescription"
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
        form="form-collection"
        disabled={isSubmitting || isPending || isUploading}
        className="flex-1"
      >
        {isSubmitting || isPending ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : isEditing ? (
          "Update Collection"
        ) : (
          "Create Collection"
        )}
      </Button>
    </form>
  );
};

export default CollectionForm;

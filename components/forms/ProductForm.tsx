"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  PlusIcon,
  Trash2,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  bulkUploadToCloudinary,
  deleteFromCloudinary,
} from "@/lib/actions/image.action";
import { createProduct, updateProduct } from "@/lib/actions/product.action";
import logger from "@/lib/logger";
import {
  ProductInput,
  productSchema,
  VariantOption,
} from "@/lib/validations/product.validation";
import { BrandWithRelations, CategoryWithChildren } from "@/types/prisma";

import ProductPreview from "../dashboard/ProductPreview";
import FilterBadge from "../filters/FilterBadge";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "../ui/animate-ui/components/animate/tabs";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface ProductFormProps {
  initialData?: Partial<ProductInput>;
  isEditing?: boolean;
  categories: CategoryWithChildren[];
  brands: BrandWithRelations[];
}

const ProductForm = ({
  initialData,
  isEditing = false,
  categories,
  brands,
}: ProductFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      categoryId: "",
      brandId: "",
      basePrice: "",
      tags: [],
      isActive: true,
      isFeatured: false,
      status: "DRAFT",
      metaTitle: "",
      metaDescription: "",
      images: [],
      productOptions: [],
      variants: [],
    },
  });

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
    move: moveImage,
  } = useFieldArray({ control: form.control, name: "images" });

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({ control: form.control, name: "productOptions" });

  const { fields: variantFields, remove: removeVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = imageFields.length;

    if (currentCount >= 8) {
      form.setError("images", {
        type: "manual",
        message: "You can add a maximum of 8 images.",
      });
      return;
    }

    const allowed = 8 - currentCount;
    const filesToUpload = Array.from(files).slice(0, allowed);

    setIsUploading(true);

    try {
      const base64Files = await Promise.all(
        filesToUpload.map((file) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        }),
      );

      const result = await bulkUploadToCloudinary({
        files: base64Files,
        folder: "products",
      });

      if (result.success && result.data) {
        result.data.forEach((image, index) => {
          appendImage({
            url: image.url,
            altText: filesToUpload[index].name,
            order: imageFields.length + index,
          });
        });

        toast.success("Images uploaded successfully");
      } else {
        toast.error("Failed to upload images", {
          description: result.error?.message || "Something went wrong.",
        });
      }
    } catch (error) {
      logger.error(`Upload error: ${error}`);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }

    if (files.length > allowed) {
      toast.warning("Some images were not uploaded", {
        description: "Maximum 8 images allowed",
      });
    }
  };

  const handleRemoveImage = async (index: number) => {
    const image = imageFields[index];

    if (image.url.includes("cloudinary.com")) {
      try {
        const urlParts = image.url.split("/");
        const uploadIndex = urlParts.indexOf("upload");
        if (uploadIndex !== -1) {
          const publicIdWithExt = urlParts.slice(uploadIndex + 2).join("/");
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");

          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        logger.error(`Failed to delete from Cloudinary: ${error}`);
      }
    }

    removeImage(index);
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: { value: string[] },
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tagInput = e.currentTarget.value.trim();

      if (tagInput && tagInput.length < 15 && !field.value.includes(tagInput)) {
        form.setValue("tags", [...field.value, tagInput], {
          shouldValidate: true,
          shouldDirty: true,
        });
        e.currentTarget.value = "";
        form.clearErrors("tags");
      } else if (tagInput.length > 15) {
        form.setError("tags", {
          type: "manual",
          message: "Tag should be less than 15 characters.",
        });
      } else if (field.value.includes(tagInput)) {
        form.setError("tags", {
          type: "manual",
          message: "Tag already exists.",
        });
      }
    }
  };

  const handleTagRemove = (tag: string, field: { value: string[] }) => {
    const newTags = field.value.filter((t) => t !== tag);

    form.setValue("tags", newTags, { shouldValidate: true, shouldDirty: true });

    if (newTags.length === 0) {
      form.setError("tags", {
        type: "manual",
        message: "Tags are required.",
      });
    }
  };

  const addOptionValue = (optionIndex: number, value: string) => {
    const currentValues = form.getValues(
      `productOptions.${optionIndex}.values`,
    );
    if (value && !currentValues.includes(value)) {
      form.setValue(`productOptions.${optionIndex}.values`, [
        ...currentValues,
        value,
      ]);
    }
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    const currentValues = form.getValues(
      `productOptions.${optionIndex}.values`,
    );
    form.setValue(
      `productOptions.${optionIndex}.values`,
      currentValues.filter((_, i) => i !== valueIndex),
    );
  };

  const generateVariants = () => {
    const options = form.getValues("productOptions");
    if (!options || options.length === 0) return;

    const combinations: {
      optionId: string;
      optionName: string;
      value: string;
    }[][] = [];

    const generate = (index: number, current: VariantOption[]) => {
      if (index === options.length) {
        combinations.push([...current]);
        return;
      }

      options[index].values.forEach((value) => {
        generate(index + 1, [
          ...current,
          {
            optionId: `temp-${index}`,
            optionName: options[index].name,
            value,
          },
        ]);
      });
    };

    generate(0, []);

    const newVariants = combinations.map((combo, index) => ({
      sku: `SKU-${Date.now()}-${index}`,
      stock: 0,
      price: parseFloat(form.getValues("basePrice") || "0"),
      compareAtPrice: null,
      image: null,
      variantOptions: combo,
    }));

    form.setValue("variants", newVariants);
  };

  const handlePublish = async (data: ProductInput) => {
    startTransition(async () => {
      if (isEditing && initialData) {
        const result = await updateProduct({
          ...data,
          id: initialData.id,
          status: "PUBLISHED",
        });

        if (result.success) {
          toast.success("Success", {
            description: "Product updated successfully.",
          });

          if (result.data) router.push("/dashboard/products");
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong.",
          });
        }

        return;
      }

      const result = await createProduct({ ...data, status: "PUBLISHED" });

      if (result.success) {
        toast.success("Success", {
          description: "Product published successfully.",
        });

        router.push("/dashboard/products");
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong.",
        });
      }
    });
  };

  const handleSaveAsDraft = async () => {
    const data = form.getValues();
    startTransition(async () => {
      if (isEditing && initialData) {
        const result = await updateProduct({
          ...data,
          id: data.id,
          status: "DRAFT",
        });

        if (result.success) {
          toast.success("Success", {
            description: "Product updated successfully.",
          });

          if (result.data) router.push("/dashboard/products");
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong.",
          });
        }

        return;
      }

      const result = await createProduct({ ...data, status: "DRAFT" });

      if (result.success) {
        toast.success("Success", {
          description: "Product saved as a draft successfully.",
        });

        router.push("/dashboard/products");
      } else {
        toast.error(`Error ${result.status}`, {
          description: result.error?.message || "Something went wrong.",
        });
      }
    });
  };

  const { isSubmitting } = form.formState;

  return (
    <Tabs defaultValue={"form"}>
      <TabsList className="w-full">
        <TabsTrigger value={"form"} className="py-2">
          Product Form
        </TabsTrigger>
        <TabsTrigger value={"preview"} className="py-2">
          Preview
        </TabsTrigger>
      </TabsList>
      <TabsContents>
        <TabsContent value="form">
          <form
            className="flex w-full flex-col gap-6"
            id="form-product"
            onSubmit={form.handleSubmit(handlePublish)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
          >
            <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
              <h2 className="text-xl font-bold">Basic Information</h2>
              <p className="text-muted-foreground">
                Provide essential details about your product, including its
                name, description, and base settings.
              </p>

              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-product-name">
                        Product Name *
                      </FieldLabel>
                      <Input
                        {...field}
                        id="form-product-name"
                        type="text"
                        aria-invalid={fieldState.invalid}
                        placeholder="Product Name"
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
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-product-description">
                        Product Description *
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id="form-product-description"
                        aria-invalid={fieldState.invalid}
                        placeholder="Describe your product in detail..."
                        rows={5}
                        className="no-focus"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="flex flex-col gap-4 md:flex-row">
                  <Controller
                    name="brandId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="flex-1"
                      >
                        <FieldLabel htmlFor="form-product-brand">
                          Brand *
                        </FieldLabel>
                        <Select
                          {...field}
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectTrigger className="no-focus">
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Brand</SelectLabel>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="categoryId"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="flex-1"
                      >
                        <FieldLabel htmlFor="form-product-category">
                          Category *
                        </FieldLabel>
                        <Select
                          {...field}
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectTrigger className="no-focus">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectGroup key={cat.id}>
                                <SelectLabel>{cat.name}</SelectLabel>
                                {cat.children &&
                                  cat.children.length > 0 &&
                                  cat.children.map((child) => (
                                    <SelectGroup
                                      key={child.id}
                                      className="pl-2"
                                    >
                                      <SelectLabel>{child.name}</SelectLabel>
                                      {child.children &&
                                        child.children.length > 0 &&
                                        child.children.map((c) => (
                                          <SelectItem
                                            key={c.id}
                                            value={c.id}
                                            className="ml-2"
                                          >
                                            {c.name}
                                          </SelectItem>
                                        ))}
                                    </SelectGroup>
                                  ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  name="tags"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-product-tags">Tags</FieldLabel>
                      <Input
                        placeholder="Type and press Enter to add tags"
                        type="text"
                        onKeyDown={(e) => handleInputKeyDown(e, field)}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        className="no-focus"
                      />
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2.5">
                          {field.value.map((tag: string) => (
                            <FilterBadge
                              key={tag}
                              label={`Tag: ${tag}`}
                              onRemove={() => handleTagRemove(tag, field)}
                            />
                          ))}
                        </div>
                      )}
                      <FieldDescription>
                        Add up to 5 tags (max 15 characters each)
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="basePrice"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="max-w-sm"
                    >
                      <FieldLabel htmlFor="form-product-basePrice">
                        Base Price *
                      </FieldLabel>
                      <div className="relative">
                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                          $
                        </span>
                        <Input
                          {...field}
                          id="form-product-basePrice"
                          type="text"
                          inputMode="decimal"
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d.]/g, "");
                            field.onChange(value);
                          }}
                          aria-invalid={fieldState.invalid}
                          autoComplete="off"
                          className="no-focus pl-8"
                        />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <div className="flex flex-col gap-4 md:flex-row">
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
                            id="form-product-isActive"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-invalid={fieldState.invalid}
                            className="size-6"
                          />
                          <FieldLabel htmlFor="form-product-isActive">
                            Activate Product
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
                            id="form-product-isFeatured"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-invalid={fieldState.invalid}
                            className="size-6"
                          />
                          <FieldLabel htmlFor="form-product-isFeatured">
                            Make Product Featured
                          </FieldLabel>
                        </div>

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </FieldGroup>
            </div>

            <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
              <h2 className="text-xl font-bold">SEO Settings</h2>
              <p className="text-muted-foreground">
                Optimize for search engines.
              </p>

              <FieldGroup>
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
              <h2 className="text-xl font-bold">Product Images *</h2>
              <p className="text-muted-foreground">
                Add and organize product images to showcase your product
                visually. You can add a maximum of 8 images.
              </p>

              <FieldGroup>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading || imageFields.length >= 8}
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    {isUploading ? (
                      <>
                        <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        Upload Images
                      </>
                    )}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading || imageFields.length >= 8}
                  />
                  {form.formState.errors.images && (
                    <FieldError errors={[form.formState.errors.images]} />
                  )}
                </div>

                {imageFields.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {imageFields.map((field, index) => (
                      <div key={field.id} className="group relative">
                        <Image
                          src={field.url}
                          alt={
                            field.altText ||
                            `${form.getValues("name")}-${index + 1}`
                          }
                          width={160}
                          height={160}
                          className="h-40 w-full rounded-lg border object-cover"
                        />
                        <div className="absolute top-2 right-2 flex flex-row-reverse gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => handleRemoveImage(index)}
                            disabled={isUploading}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            disabled={
                              index === imageFields.length - 1 || isUploading
                            }
                            onClick={() => moveImage(index, index + 1)}
                          >
                            <ArrowRightIcon className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            disabled={index === 0 || isUploading}
                            onClick={() => moveImage(index, index - 1)}
                          >
                            <ArrowLeftIcon className="size-4" />
                          </Button>
                        </div>
                        <Controller
                          control={form.control}
                          name={`images.${index}.altText`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Alt text"
                              className="mt-2 text-sm"
                            />
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </FieldGroup>
            </div>

            <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-bold">Product Options *</h2>
                  <p className="text-muted-foreground">
                    Define customizable options like size, color, or material.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={"outline"}
                  size={"sm"}
                  onClick={() => appendOption({ name: "", values: [] })}
                >
                  <PlusIcon className="mr-2 size-4" />
                  Add Option
                </Button>
              </div>

              <FieldGroup>
                {optionFields.length === 0 && (
                  <FieldError
                    errors={[
                      { message: "At least one product option is required" },
                    ]}
                  />
                )}
                {optionFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col gap-3 rounded-lg border p-4"
                  >
                    <div className="flex items-start gap-2">
                      <Controller
                        name={`productOptions.${index}.name`}
                        control={form.control}
                        render={({ field: nameField, fieldState }) => (
                          <div className="flex flex-1 flex-col gap-3">
                            <Input
                              {...nameField}
                              placeholder="Option name (e.g., Size, Color)"
                              className="no-focus"
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </div>
                        )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </div>

                    <div>
                      <Input
                        placeholder="Type value and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            if (value) {
                              addOptionValue(index, value);
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                        className="no-focus"
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {form
                          .watch(`productOptions.${index}.values`)
                          ?.map((value, vIndex) => (
                            <FilterBadge
                              key={vIndex}
                              label={value}
                              onRemove={() => removeOptionValue(index, vIndex)}
                            />
                          ))}
                      </div>
                      {form.watch(`productOptions.${index}.values`).length ===
                        0 && (
                        <FieldError
                          errors={[
                            {
                              message: "At least one option value is required",
                            },
                          ]}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </FieldGroup>
            </div>

            <div className="bg-muted border-border flex flex-col gap-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl font-bold">Product Variants</h2>
                  <p className="text-muted-foreground">
                    Manage individual product variants created from your
                    options.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateVariants}
                  disabled={optionFields.length === 0}
                >
                  Generate Variants
                </Button>
              </div>

              <FieldGroup>
                {variantFields.length === 0 && (
                  <FieldError errors={[form.formState.errors.variants]} />
                )}
                {variantFields.length > 0 && (
                  <div className="space-y-3">
                    {variantFields.map((variant, index) => (
                      <div key={variant.id} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="font-medium">
                            {variant.variantOptions
                              ?.map((opt) => opt.value)
                              .join(" / ")}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                          <Controller
                            name={`variants.${index}.sku`}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <div>
                                <FieldLabel>SKU</FieldLabel>
                                <Input {...field} className="no-focus" />
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </div>
                            )}
                          />

                          <Controller
                            name={`variants.${index}.price`}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <div>
                                <FieldLabel>Price</FieldLabel>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="no-focus"
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                />
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </div>
                            )}
                          />

                          <Controller
                            name={`variants.${index}.stock`}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <div>
                                <FieldLabel>Stock</FieldLabel>
                                <Input
                                  {...field}
                                  type="number"
                                  min="0"
                                  className="no-focus"
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
                                />
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </div>
                            )}
                          />

                          <Controller
                            name={`variants.${index}.compareAtPrice`}
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <div>
                                <FieldLabel>Compare Price</FieldLabel>
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={field.value || ""}
                                  className="no-focus"
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : null,
                                    )
                                  }
                                />
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </div>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </FieldGroup>
            </div>

            <div className="flex flex-col gap-4 md:flex-row">
              <Button
                type="button"
                variant={"secondary"}
                disabled={isSubmitting || isPending}
                className="flex-1"
                onClick={handleSaveAsDraft}
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as Draft"
                )}
              </Button>
              <Button
                type="submit"
                form="form-product"
                disabled={isSubmitting || isPending}
                className="flex-1"
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : isEditing ? (
                  "Update Product"
                ) : (
                  "Publish Product"
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="preview">
          <ProductPreview />
        </TabsContent>
      </TabsContents>
    </Tabs>
  );
};

export default ProductForm;

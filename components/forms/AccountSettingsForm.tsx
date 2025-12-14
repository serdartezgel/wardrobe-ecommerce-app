"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2Icon, UploadIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "@/lib/actions/image.action";
import { User } from "@/lib/auth";
import { changePassword, updateUser } from "@/lib/auth-client";
import logger from "@/lib/logger";
import { getInitials } from "@/lib/utils";
import { extractPublicIdFromUrl } from "@/lib/utils/image";
import {
  AccountFormValues,
  accountSchema,
  PasswordChangeInput,
  passwordChangeSchema,
} from "@/lib/validations/account.validation";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

const AccountSettingsForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const initials = getInitials(user.name);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      image: user.image || undefined,
    },
  });

  const passwordForm = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

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
        folder: "avatars",
      });

      if (!result.success || !result.data) {
        throw new Error(result.error?.message);
      }
      let previousPublicId;
      const previousImageUrl = form.getValues("image");
      if (previousImageUrl)
        previousPublicId = extractPublicIdFromUrl(previousImageUrl);
      if (previousPublicId) {
        await deleteFromCloudinary(previousPublicId);
      }

      form.setValue("image", result.data.url, {
        shouldDirty: true,
        shouldValidate: true,
      });

      await updateUser({ image: form.getValues("image") });

      toast.success("Profile image updated");
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

    toast.success("Profile image deleted");
  };

  const handleSubmit = async (data: AccountFormValues) => {
    startTransition(async () => {
      const result = await updateUser({ name: data.name });

      console.log(result);
      if (result.data?.status) {
        toast.success("Account updated successfully");
        router.refresh();
      } else {
        toast.error(result.error?.message || "Update failed");
      }
    });
  };

  const handlePasswordSubmit = async (data: PasswordChangeInput) => {
    try {
      const { newPassword, currentPassword } = data;
      const { error } = await changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });
      if (error) {
        throw new Error(error.message);
      } else {
        toast.success("Password changed successfully!");
      }
      passwordForm.reset();
    } catch (error) {
      logger.error({ err: error }, "Failed to change password");
      toast.error("Failed to change password");
    }
  };

  const { isSubmitting: isProfileSubmitting } = form.formState;
  const { isSubmitting: isPasswordSubmitting } = passwordForm.formState;

  return (
    <>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="bg-card flex flex-col gap-6 rounded-lg border p-6"
      >
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarImage src={form.watch("image") || undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={
                isPending ||
                isUploading ||
                isPasswordSubmitting ||
                isProfileSubmitting
              }
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" />
                  Upload Avatar
                </>
              )}
            </Button>

            {form.watch("image") && (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={handleRemoveImage}
                disabled={
                  isPending ||
                  isUploading ||
                  isPasswordSubmitting ||
                  isProfileSubmitting
                }
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            )}

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Full Name *</FieldLabel>
                <Input {...field} className="no-focus" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Email</FieldLabel>
                <Input {...field} disabled type="email" className="no-focus" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isPending || isUploading}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={
              isPending ||
              isUploading ||
              isPasswordSubmitting ||
              isProfileSubmitting
            }
          >
            {isProfileSubmitting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </div>
      </form>

      <form
        onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
        className="bg-card flex flex-col gap-6 rounded-lg border p-6"
      >
        <FieldGroup>
          <Controller
            name="currentPassword"
            control={passwordForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Current Password *</FieldLabel>
                <Input
                  type="password"
                  {...field}
                  className="no-focus"
                  placeholder="Enter your current password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="newPassword"
            control={passwordForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>New Password *</FieldLabel>
                <Input
                  type="password"
                  {...field}
                  className="no-focus"
                  placeholder="Enter your new password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={passwordForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Confirm New Password *</FieldLabel>
                <Input
                  type="password"
                  {...field}
                  className="no-focus"
                  placeholder="Confirm your new password"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={
              isPending ||
              isUploading ||
              isPasswordSubmitting ||
              isProfileSubmitting
            }
          >
            {passwordForm.formState.isSubmitting && (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            )}
            Change Password
          </Button>
        </div>
      </form>
    </>
  );
};

export default AccountSettingsForm;

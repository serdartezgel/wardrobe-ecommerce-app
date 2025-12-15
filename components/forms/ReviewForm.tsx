"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { StarIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateReview, createReview } from "@/lib/actions/review.action";
import { ReviewInput, reviewSchema } from "@/lib/validations/review.validation";
import { ReviewWithRelations } from "@/types/prisma";

import { Button } from "../ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface ReviewFormProps {
  productId: string;
  orderId: string;
  existingReview?: ReviewWithRelations;
  onSuccess?: () => void;
}

const ReviewForm = ({
  productId,
  orderId,
  existingReview,
  onSuccess,
}: ReviewFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: existingReview
      ? {
          id: existingReview.id,
          productId: existingReview.productId,
          orderId: existingReview.orderId,
          rating: existingReview.rating,
          title: existingReview.title || "",
          comment: existingReview.comment || "",
        }
      : {
          productId,
          orderId,
          rating: 0,
          title: "",
          comment: "",
        },
  });

  const handleSubmit = async (data: ReviewInput) => {
    startTransition(async () => {
      if (existingReview) {
        const result = await updateReview({
          id: existingReview.id,
          ...data,
        });

        if (result.success) {
          toast.success("Success", {
            description: "Review updated successfully.",
          });
          router.refresh();
          onSuccess?.();
        } else {
          toast.error(`Error ${result.status}`, {
            description: result.error?.message || "Something went wrong.",
          });
        }
      } else {
        const result = await createReview(data);

        if (result.success) {
          toast.success("Success", {
            description: "Review submitted successfully.",
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
  const rating = form.watch("rating");

  return (
    <form
      id="form-review"
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
          name="rating"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Rating *</FieldLabel>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => field.onChange(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <StarIcon
                      className={`size-8 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-muted-foreground ml-2 text-sm">
                    {rating} out of 5 stars
                  </span>
                )}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-review-title">
                Review Title (Optional)
              </FieldLabel>
              <Input
                {...field}
                id="form-review-title"
                type="text"
                aria-invalid={fieldState.invalid}
                placeholder="Summarize your experience"
                autoComplete="off"
                className="no-focus"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="comment"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-review-comment">
                Your Review (Optional)
              </FieldLabel>
              <Textarea
                {...field}
                id="form-review-comment"
                aria-invalid={fieldState.invalid}
                placeholder="Tell us about your experience with this product..."
                rows={6}
                autoComplete="off"
                className="no-focus"
              />
              <FieldDescription>
                {field.value?.length || 0} characters
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        form="form-review"
        disabled={isSubmitting || isPending}
        className="w-full"
      >
        {isSubmitting || isPending ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : existingReview ? (
          "Update Review"
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  );
};
export default ReviewForm;

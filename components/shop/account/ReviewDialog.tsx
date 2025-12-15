"use client";

import { useState } from "react";

import ReviewForm from "@/components/forms/ReviewForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReviewWithRelations } from "@/types/prisma";

type ReviewDialogProps = {
  productId: string;
  orderId: string;
  productName: string;
  existingReview?: ReviewWithRelations;
  children: React.ReactNode;
};

const ReviewDialog = ({
  productId,
  orderId,
  productName,
  existingReview,
  children,
}: ReviewDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Edit Review" : "Write a Review"}
          </DialogTitle>
          <DialogDescription>
            Share your experience with {productName}
          </DialogDescription>
        </DialogHeader>
        <ReviewForm
          productId={productId}
          orderId={orderId}
          existingReview={existingReview}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;

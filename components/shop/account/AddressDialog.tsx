"use client";

import { useState } from "react";

import AddressForm from "@/components/forms/AddressForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Address } from "@/lib/generated/prisma";
import { AddressInput } from "@/lib/validations/address.validation";

type AddressDialogProps = {
  address?: Address;
  children: React.ReactNode;
};

const AddressDialog = ({ address, children }: AddressDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {address ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            {address
              ? "Update your shipping address details"
              : "Add a new shipping address to your account"}
          </DialogDescription>
        </DialogHeader>
        <AddressForm
          address={address as AddressInput}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;

import { MapPinIcon, PlusIcon } from "lucide-react";

import AddressCard from "@/components/cards/AddressCard";
import AddressDialog from "@/components/shop/account/AddressDialog";
import { Button } from "@/components/ui/button";
import { getUserAddresses } from "@/lib/actions/address.action";

const CustomerAddressesPage = async () => {
  const result = await getUserAddresses();

  const addresses = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Addresses</h1>
          <p className="text-muted-foreground mt-2">
            Manage your shipping addresses
          </p>
        </div>

        <AddressDialog>
          <Button>
            <PlusIcon className="mr-2 size-4" />
            Add Address
          </Button>
        </AddressDialog>
      </div>

      {!addresses || addresses.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <MapPinIcon className="text-muted-foreground mb-4 size-16" />
          <h3 className="mb-2 text-lg font-semibold">No addresses yet</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            Add a shipping address to make checkout faster
          </p>
          <AddressDialog>
            <Button>
              <PlusIcon className="mr-2 size-4" />
              Add Your First Address
            </Button>
          </AddressDialog>
        </div>
      ) : (
        <div className="w-full space-y-4">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerAddressesPage;

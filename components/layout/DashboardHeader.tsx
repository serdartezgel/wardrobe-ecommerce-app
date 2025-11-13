import Link from "next/link";

import { User } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

import ModeToggle from "../common/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const DashboardHeader = ({ user }: { user: User }) => {
  return (
    <div className="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex w-full items-center justify-end gap-6 border-b py-4 backdrop-blur">
      <ModeToggle />
      <Link href={"/dashboard/profile"} className="flex items-center gap-4">
        <div className="flex flex-col">
          <p className="font-medium">{user.name}</p>
          <span className="text-accent-foreground text-xs">{user.role}</span>
        </div>
        <Avatar className="border-border h-10 w-10 border">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback className="text-primary">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </Link>
    </div>
  );
};

export default DashboardHeader;

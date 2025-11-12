import Link from "next/link";

import { User } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

import ModeToggle from "../common/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const DashboardHeader = ({ user }: { user: User }) => {
  return (
    <div className="mt-2 mr-10 flex items-center justify-end gap-6 border-b px-6 py-4">
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

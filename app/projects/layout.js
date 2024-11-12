// app/dashboard/layout.js
"use client";
import { signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";

const Navbar = ({ user }) => (
  <nav className="bg-gray-50 border border-b-2 shadow-sm p-4 flex items-center justify-between">
    <ul className="flex space-x-4 text-black">
      <h2 className="text-2xl font-bold">SEO AUDITOR</h2>
    </ul>

    <div className="flex items-center space-x-4">
      <span className="text-md text-gray-700 capitalize">{user?.name}</span>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src="/profile-pic.jpg" alt="Profile" />
            <AvatarFallback className="bg-black text-white">
              {user?.name?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Logout
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </nav>
);

const DashboardLayout = ({ children }) => {
  const { data: user, status } = useSession();

  return (
    <div>
      <Navbar user={user?.user} />
      <main>{children}</main>
    </div>
  );
};

export default DashboardLayout;

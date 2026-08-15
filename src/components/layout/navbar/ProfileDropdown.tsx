"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { useLogout } from "@/hooks/api/use-auth";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";

export function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const logout = useLogout();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <button
            className="flex cursor-pointer items-center gap-2 rounded-full pr-3 pl-1 py-1 hover:bg-muted transition-colors"
            aria-label="Profile"
          />
        }
      >
        {user ? (
          <>
            <Avatar className="size-8">
              <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground lg:block">{user.name}</span>
          </>
        ) : (
          <Avatar className="size-8">
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        )}
      </DropdownMenuTrigger>

      {user && (
        <DropdownMenuContent
          align="end"
          alignOffset={-4}
          sideOffset={12}
          className="w-56 rounded-xl p-0 shadow-lg"
        >
          <div className="px-4 pt-3 pb-2">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          <DropdownMenuSeparator className="mx-4 my-0" />

          <div className="p-1">
            <DropdownMenuItem
              className="cursor-pointer rounded-lg py-2"
              onClick={() => {
                setOpen(false);
                router.push(`/${user.role}/profile`);
              }}
            >
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer rounded-lg py-2"
              onClick={() => {
                setOpen(false);
                router.push(`/${user.role}/settings`);
              }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="mx-4 my-0" />

          <div className="p-1">
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer rounded-lg py-2"
              onClick={() => {
                setOpen(false);
                logout.mutate();
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}

"use client";

import { Flame, Home, PlusIcon, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";
import { LoginButton } from "./login-button";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar";
import SearchBar from "./searchbar";

export function TopBar() {
  const [isPending, setIsPending] = useState(true);
  const [sessionUser, setSessionUser] = useState<{
    image?: string | null;
    name?: string | null;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const { data } = await authClient.getSession();
        if (!isMounted) return;
        setSessionUser(data?.user ?? null);
      } finally {
        if (isMounted) setIsPending(false);
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const avatarFallback = (name?: string | null) => {
    if (!name?.trim()) return "??";

    const parts = name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }

    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-orange-200/70 backdrop-blur dark:border-orange-900/60 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm shadow-orange-500/30">
            <Flame className="size-4" />
          </span>
          <span className="text-base font-bold tracking-tight text-orange-700 dark:text-orange-300">
            Cinder
          </span>
        </div>

        <div className="flex flex-1 justify-center px-2">
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
        </div>

        <nav className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-orange-700 hover:bg-orange-100/70 hover:text-orange-800 dark:text-orange-200 dark:hover:bg-orange-950/40"
          >
            <Home className="size-4" />
            Home
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-orange-700 hover:bg-orange-100/70 hover:text-orange-800 dark:text-orange-200 dark:hover:bg-orange-950/40"
          >
            <Users className="size-4" />
            Communities
          </Button>

          {!isPending && sessionUser ? (
            <Avatar>
              <AvatarImage
                src={sessionUser.image ?? undefined}
                alt={sessionUser.name ?? undefined}
              />
              <AvatarFallback>
                {avatarFallback(sessionUser.name)}
              </AvatarFallback>
              <AvatarBadge>
                <PlusIcon />
              </AvatarBadge>
            </Avatar>
          ) : (
            <LoginButton />
          )}
        </nav>
      </div>
    </header>
  );
}

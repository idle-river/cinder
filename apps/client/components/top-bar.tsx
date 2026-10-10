import { Flame, Home, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-orange-200/70 bg-orange-50/95 backdrop-blur supports-[backdrop-filter]:bg-orange-50/80 dark:border-orange-900/60 dark:bg-zinc-950/95 dark:supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm shadow-orange-500/30">
            <Flame className="size-4" />
          </span>
          <span className="text-base font-bold tracking-tight text-orange-700 dark:text-orange-300">
            Cinder
          </span>
        </div>

        <nav className="flex items-center gap-2">
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
        </nav>
      </div>
    </header>
  );
}

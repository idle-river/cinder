import { Flame, Users } from "lucide-react";

import { TopBar } from "@/components/top-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Feed from "@/components/feed";

export default function Home() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-orange-50/60 via-background to-background dark:from-orange-950/10">
      <TopBar />

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <section className="space-y-4">
          <div className="space-y-1">
            <h1 className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent dark:from-orange-300 dark:to-amber-200">
              Home feed
            </h1>
          </div>

          <Feed />
        </section>

        <aside className="space-y-4">
          <Card className="border-orange-200/60 shadow-sm shadow-orange-100/40 dark:border-orange-900/40 dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-orange-700 dark:text-orange-200">
                <Users className="size-4" />
                Communities
              </CardTitle>
              <CardDescription>
                Discover and join communities on Cinder.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* {communities.map((community, index) => (
                <div key={community.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Flame className="size-4 text-orange-500" />
                      <span className="text-sm font-medium">
                        c/{community.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {community.members}
                    </span>
                  </div>
                  {index !== communities.length - 1 ? (
                    <Separator className="mt-3" />
                  ) : null}
                </div>
              ))} */}
              <p>Under construction...</p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

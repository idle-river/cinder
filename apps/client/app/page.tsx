import { Flame, Heart, MessageCircle, Users } from "lucide-react";

import { TopBar } from "@/components/top-bar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const posts = [
  {
    id: 1,
    author: "maaz",
    community: "build-in-public",
    title: "Just shipped the first Cinder homepage mock 🔥",
    content:
      "Kept it minimal for now: top bar, feed cards, and a community panel. Next up is wiring this to real data.",
    likes: 38,
    comments: 12,
    postedAt: "2h ago",
  },
  {
    id: 2,
    author: "sarah",
    community: "product-design",
    title: "Thoughts on social feed density?",
    content:
      "Do you prefer spacious cards or compact rows for fast scrolling? I’m testing both for a creator-focused feed.",
    likes: 24,
    comments: 9,
    postedAt: "5h ago",
  },
  {
    id: 3,
    author: "devon",
    community: "frontend",
    title: "Tailwind + shadcn feels really fast for MVP UI",
    content:
      "Swapped out a raw layout for shadcn cards and the app already feels much more structured. Great for iteration.",
    likes: 57,
    comments: 16,
    postedAt: "1d ago",
  },
];

const communities = [
  {
    id: 1,
    name: "build-in-public",
    members: "8.2k members",
  },
  {
    id: 2,
    name: "frontend",
    members: "12.4k members",
  },
  {
    id: 3,
    name: "product-design",
    members: "5.7k members",
  },
];

export default function Home() {
  const {
    data: rawPosts,
    error: postsError,
    isLoading: postsLoad,
    isError: postsIsErr,
    isSuccess: postsSuccess,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      return await api.post.get();
    },
  });

  const [posts, setPosts] = useState(null);

  useEffect(() => {
    if (rawPosts && rawPosts.data?.ok) {
      setPosts(rawPosts.data.data);
    }

    if (postsIsErr) {
      toast.error(postsError!.message);
    }
  }, [postsLoad, postsIsErr, postsLoad, postsSuccess]);

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

          {posts.map((post) => (
            <Card
              key={post.id}
              className="border-orange-200/60 shadow-sm shadow-orange-100/40 dark:border-orange-900/40 dark:shadow-none"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm text-orange-700 dark:text-orange-300">
                    @{post.author} in c/{post.community}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {post.postedAt}
                  </span>
                </div>
                <CardDescription className="pt-1 text-base font-medium text-foreground">
                  {post.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 text-rose-500 dark:text-rose-300">
                    <Heart className="size-4" />
                    {post.likes}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
                    <MessageCircle className="size-4" />
                    {post.comments}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
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
              {communities.map((community, index) => (
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
              ))}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

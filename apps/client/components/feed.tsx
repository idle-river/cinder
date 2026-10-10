"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { toast } from "sonner";

type PostResponse = Awaited<ReturnType<typeof api.post.get>>;

type Post = NonNullable<NonNullable<PostResponse["data"]>["data"]>[number];

export default function Feed() {
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

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (rawPosts && rawPosts.data && rawPosts.data?.ok && rawPosts.data.data) {
      setPosts(rawPosts.data.data);
    }

    if (postsIsErr) {
      toast.error(postsError!.message);
    }
  }, [postsLoad, postsIsErr, postsLoad, postsSuccess]);

  return (
    <>
      {posts.length == 0 && <p>No posts made...</p>}
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
    </>
  );
}

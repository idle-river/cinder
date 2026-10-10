"use client";

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
import { Heart, MessageCircle } from "lucide-react";

type PostResponse = Awaited<ReturnType<typeof api.post.get>>;
type Post = NonNullable<NonNullable<PostResponse["data"]>["data"]>[number];

async function lookUpAuthor(id: string) {
  return api.author({ id }).get({
    query: { userId: id },
  });
}

async function lookUpCommunity(id: string) {
  return api.community({ id }).get({
    query: { communityId: id },
  });
}

function AuthorName({ authorId }: { authorId: string }) {
  const { data: author } = useQuery({
    queryKey: ["author", authorId],
    queryFn: async () => {
      const response = await lookUpAuthor(authorId);

      if (response.error || !response.data?.ok || !response.data.data) {
        return null;
      }

      return response.data.data;
    },
  });

  return <span>{author ? `@${author.name}` : "@unknown"}</span>;
}

function CommunityName({ communityId }: { communityId: string }) {
  const { data: community } = useQuery({
    queryKey: ["community", communityId],
    queryFn: async () => {
      const response = await lookUpCommunity(communityId);

      if (response.error || !response.data?.ok || !response.data.data) {
        return null;
      }

      return response.data.data;
    },
  });

  return (
    <span>
      {community
        ? `c/${typeof community === "string" ? community : "unknown"}`
        : "c/unknown"}
    </span>
  );
}

export default function Feed() {
  const {
    data: posts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await api.post.get();

      if (response.error || !response.data?.ok || !response.data.data) {
        const error = response.error?.value;
        console.error(error);
        toast.error(
          typeof error === "string" ? error : "An unknown error occurred.",
        );
        throw new Error("Failed to fetch posts");
      }

      return response.data.data;
    },
  });

  if (isLoading) {
    return <p>Loading posts...</p>;
  }

  if (isError) {
    return <p>Failed to load posts.</p>;
  }

  if (posts.length === 0) {
    return <p>No posts made...</p>;
  }

  return (
    <>
      {posts.map((post) => (
        <Card
          key={post.id}
          className="border-orange-200/60 shadow-sm shadow-orange-100/40 dark:border-orange-900/40 dark:shadow-none"
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm text-orange-700 dark:text-orange-300">
                <AuthorName authorId={post.authorId} /> in{" "}
                <CommunityName communityId={post.communityId} />
              </CardTitle>

              <span className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleString()}
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
                {post.score}
              </span>

              <span className="inline-flex items-center gap-1.5 text-sky-600 dark:text-sky-300">
                <MessageCircle className="size-4" />
                {post.commentCount}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

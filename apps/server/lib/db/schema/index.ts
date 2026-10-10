export * from "./auth";

import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

// ─── Communities (subreddits) ──────────────────────────

export const communities = pgTable("community", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  banner: text("banner"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  creatorId: text("creator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// ─── Community Memberships ─────────────────────────────

export const communityMembers = pgTable(
  "community_member",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    communityId: text("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("community_member_user_community_idx").on(
      table.userId,
      table.communityId,
    ),
  ],
);

// ─── Posts ──────────────────────────────────────────────

export const posts = pgTable(
  "post",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content"),
    url: text("url"),
    type: text("type").default("text").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    communityId: text("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    editedAt: timestamp("edited_at", { withTimezone: true }),
    score: integer("score").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    isLocked: boolean("is_locked").default(false).notNull(),
    isNsfw: boolean("is_nsfw").default(false).notNull(),
    isSpoiler: boolean("is_spoiler").default(false).notNull(),
  },
  (table) => [
    index("post_community_created_idx").on(table.communityId, table.createdAt),
    index("post_author_idx").on(table.authorId),
  ],
);

// ─── Recursive Comments ────────────────────────────────

export const comments = pgTable(
  "comment",
  {
    id: text("id").primaryKey(),
    content: text("content").notNull(),

    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),

    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // NULL means this is a top-level comment.
    parentId: text("parent_id"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    editedAt: timestamp("edited_at", { withTimezone: true }),

    score: integer("score").default(0).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
  },
  (table) => [
    index("comment_post_created_idx").on(table.postId, table.createdAt),
    index("comment_parent_idx").on(table.parentId),
    index("comment_author_idx").on(table.authorId),
  ],
);

// ─── Comment Self-Reference ────────────────────────────

// Define the self-referencing FK separately to make the
// TypeScript declaration straightforward.
export const commentRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(user, {
    fields: [comments.authorId],
    references: [user.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, {
    relationName: "comment_replies",
  }),
}));

export const postRelations = relations(posts, ({ one, many }) => ({
  author: one(user, {
    fields: [posts.authorId],
    references: [user.id],
  }),
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id],
  }),
  comments: many(comments),
}));

export const userRelations = relations(user, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  memberships: many(communityMembers),
}));

export const communityRelations = relations(communities, ({ one, many }) => ({
  creator: one(user, {
    fields: [communities.creatorId],
    references: [user.id],
  }),
  posts: many(posts),
  members: many(communityMembers),
}));

export const communityMemberRelations = relations(
  communityMembers,
  ({ one }) => ({
    user: one(user, {
      fields: [communityMembers.userId],
      references: [user.id],
    }),
    community: one(communities, {
      fields: [communityMembers.communityId],
      references: [communities.id],
    }),
  }),
);

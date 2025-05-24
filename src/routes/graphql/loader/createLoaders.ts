import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library.js";
import DataLoader from "dataloader";

import { PostType } from "../types/Post.js";


export function createLoaders(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
  return {
    user: {
      posts: new DataLoader(async (ids: readonly string[]) => {
        const posts = await prisma.post.findMany({ where: { authorId: { in: [...ids] } } });

        const postsByAuthorId: { [key: string]: PostType[] } = {};
        posts.forEach(post => {
          if (!postsByAuthorId[post.authorId]) {
            postsByAuthorId[post.authorId] = [];
          }
          postsByAuthorId[post.authorId].push(post);
        });

        return ids.map(id => postsByAuthorId[id] || []);
      }),
      profile: new DataLoader(async (userIds: readonly string[]) => {
        const profiles = await prisma.profile.findMany({
          where: {
            userId: { in: [...userIds] },
          },
        });

        const profilesByUserId: { [key: string]: unknown[] } = {};
        profiles.forEach(p => {
          if (!profilesByUserId[p.userId]) {
            profilesByUserId[p.userId] = [];
          }
          profilesByUserId[p.userId].push(p);
        });

        return userIds.map(id => profilesByUserId[id] || []);
      }),
      userSubscribedTo: new DataLoader(async (ids: readonly string[]) => {
        const authors = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: { in: [...ids] } },
          include: { author: true },
        });

        const authorsById: { [key: string]: unknown[] } = {};
        authors.forEach(author => {
          if (!authorsById[author.subscriberId]) {
            authorsById[author.subscriberId] = [];
          }
          authorsById[author.subscriberId].push(author.author);
        });

        return ids.map(id => authorsById[id] || []);
      }),
      subscribedToUser: new DataLoader(async (ids: readonly string[]) => {
        const subscribers = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: { in: [...ids] } },
          include: { subscriber: true },
        });

        const subsById: { [key: string]: unknown[] } = {};
        subscribers.forEach(sub => {
          if (!subsById[sub.authorId]) {
            subsById[sub.authorId] = [];
          }
          subsById[sub.authorId].push(sub.subscriber);
        });

        return ids.map(id => subsById[id] || []);
      }),
    },
    profile: {
      memberTypes: new DataLoader(async (ids: readonly string[]) => {
        return await prisma.memberType.findMany({
          where: {
            id: { in: [...ids] },
          },
        });
      }),
    }
  };
}

import DataLoader from "dataloader";

import { PostType } from "../types/Post.js";
import { Author, Subscriber, User } from "../types/User.js";
import { GlobalCache } from "./createLoaders.js";
import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library.js";


export function createUserBatchers(globalCache: GlobalCache, prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
  return {
    all: {
      load: async ({
        fetchAuthors = false, fetchSubs = false
      }: { fetchAuthors: boolean, fetchSubs: boolean }) => {
        if (globalCache.users.length === 0) {
          const users = await prisma.user.findMany({
            include: {
              userSubscribedTo: fetchAuthors,
              subscribedToUser: fetchSubs,
            }
          });
          globalCache.users = users
        }

        return globalCache.users;
      }
    },
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
      let authors: Author[];
      if (globalCache.users.length === 0) {
        authors = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: { in: [...ids] } },
          include: { author: true },
        });
      } else {
        authors = getAuthorsById(globalCache.users, [...ids]);
      }


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
      let subscribers: Subscriber[];
      if (globalCache.users.length === 0) {
        subscribers = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: { in: [...ids] } },
          include: { subscriber: true },
        });
      } else {
        subscribers = getSubscribersById(globalCache.users, [...ids]);
      }

      const subsById: { [key: string]: unknown[] } = {};
      subscribers.forEach(sub => {
        if (!subsById[sub.authorId]) {
          subsById[sub.authorId] = [];
        }
        subsById[sub.authorId].push(sub.subscriber);
      });

      return ids.map(id => subsById[id] || []);
    }),
  }
}


function getRelatedUsers<T>(
  users: User[],
  ids: string[],
  subscriptionKey: 'userSubscribedTo' | 'subscribedToUser',
  relatedUserIdKey: 'authorId' | 'subscriberId',
  resultUserKey: 'author' | 'subscriber'
): T[] {
  const subs = users
    .filter(user => ids.includes(user.id))
    .flatMap(u => u[subscriptionKey] || []);

  const results: T[] = subs.map(sub => {
    const relatedUserId = sub[relatedUserIdKey];
    const relatedUser = users.find(user => user.id === relatedUserId);

    if (!relatedUser) {
      return null;
    }

    // Construct the result object
    const baseResult = {
      authorId: sub.authorId,
      subscriberId: sub.subscriberId,
    };
    baseResult[resultUserKey] = relatedUser;

    return baseResult as T;
  }).filter(item => item !== null) as T[]; // Filter out null results

  return results;
}


function getAuthorsById(users: User[], ids: string[]): Author[] {
  return getRelatedUsers<Author>(
    users,
    ids,
    'userSubscribedTo',
    'authorId',
    'author'
  );
}


function getSubscribersById(users: User[], ids: string[]): Subscriber[] {
  return getRelatedUsers<Subscriber>(
    users,
    ids,
    'subscribedToUser',
    'subscriberId',
    'subscriber'
  );
}
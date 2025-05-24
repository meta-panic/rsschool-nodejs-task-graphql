import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library.js";

import { User } from "../types/User.js";
import { createUserBatchers } from "./userBatchers.js";
import { createProfileBatchers } from "./profileBatchers.js";


export type GlobalCache = {
  users: User[]
};

export function createLoaders(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
  const globalCache: GlobalCache = {
    users: []
  }

  return {
    user: createUserBatchers(globalCache, prisma),
    profile: createProfileBatchers(globalCache, prisma)
  };
}

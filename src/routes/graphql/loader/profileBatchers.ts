import DataLoader from "dataloader";
import { PrismaClient, Prisma } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library.js";


export function createProfileBatchers(_, prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
  return {
    memberTypes: new DataLoader(async (ids: readonly string[]) => {
      return await prisma.memberType.findMany({
        where: {
          id: { in: [...ids] },
        },
      });
    }),
  }
}
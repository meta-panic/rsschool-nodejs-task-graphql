import { PrismaClient } from "@prisma/client";
import { createLoaders } from "./loader/createLoaders.js";


export type Context = { prisma: PrismaClient, loaders: ReturnType<typeof createLoaders> }

import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLFloat, GraphQLList } from "graphql";

import { UUIDType } from "./uuid.js";
import { PostType } from "./Post.js";
import { ProfileType } from "./Profile.js";
import { Context } from "../types.js";


type User = {
  id: string;
  name: string;
  balance: number;
}

const UserType: GraphQLObjectType<User, Context> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: UUIDType,
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
    profile: {
      type: ProfileType,
      resolve: async (user: User, _, { prisma }: Context) => {
        return await prisma.profile.findUnique({ where: { userId: user.id } });
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (user: User, _, { prisma }: Context) => {
        return await prisma.post.findMany({ where: { authorId: user.id } });
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (user: User, _, { prisma }: Context) => {
        const authors = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId: user.id },
          include: { author: true },
        });

        return authors.map(sub => sub.author);
      }
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user: User, _, { prisma }: Context) => {
        const subscrubers = await prisma.subscribersOnAuthors.findMany({
          where: { authorId: user.id },
          include: { subscriber: true },
        });

        return subscrubers.map(sub => sub.subscriber);
      }
    },
  }),
});

export { UserType } 
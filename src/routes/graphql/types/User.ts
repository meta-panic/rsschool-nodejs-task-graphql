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
      type: new GraphQLNonNull(UUIDType),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    profile: {
      type: ProfileType,
      resolve: async (user: User, _, { prisma }: Context) => {
        const kek = await prisma.profile.findUnique({ where: { userId: user.id } });
        return kek;
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (user: User, _, { prisma }: Context) => {
        const kek = await prisma.post.findMany({ where: { authorId: user.id } });
        return kek
      }
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(UserType),
    },
    subscribedToUser: {
      type: new GraphQLNonNull(UserType),
    },
  }),
});

export { UserType } 
import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList } from "graphql";

import { UUIDType } from "./uuid.js";
import { PostType } from "./Post.js";
import { ProfileType } from "./Profile.js";
import { Context } from "../types.js";


export type User = {
  id: string;
  name: string;
  balance: number;
  userSubscribedTo?: Subscription[];
  subscribedToUser?: Subscription[];
}

export type Subscriber = {
  subscriber: User;
} & Subscription;

export type Subscription = {
  authorId: string;
  subscriberId: string;
};

export type Author = {
  author: User;
} & Subscription;

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
      resolve: async (user: User, _, { loaders }: Context) => {

        const profile = await loaders.user.profile.load(user.id);
        return profile.length > 0 ? profile[0] : null;
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (user: User, _, { loaders }: Context) => {
        return await loaders.user.posts.load(user.id);
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (user: User, _, { loaders }: Context) => {
        return await loaders.user.userSubscribedTo.load(user.id);
      }
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (user: User, _, { loaders }: Context) => {
        return await loaders.user.subscribedToUser.load(user.id);
      }
    },
  }),
});

export { UserType } 
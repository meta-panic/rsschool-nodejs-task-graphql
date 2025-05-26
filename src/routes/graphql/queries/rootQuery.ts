import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from "graphql";
import { parseResolveInfo } from "graphql-parse-resolve-info";

import { MemberType, MemberTypeIdEnum } from "../types/MemberType.js";
import { PostType } from "../types/Post.js";
import { ProfileType } from "../types/Profile.js";
import { UserType } from "../types/User.js";
import { UUIDType } from "../types/uuid.js";
import { Context } from '../types.js';


export const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_, __, { prisma }: Context) => {
        return await prisma.memberType.findMany();
      }
    },
    memberType: {
      type: MemberType,
      args: {
        id: {
          description: 'type of the member type',
          type: new GraphQLNonNull(MemberTypeIdEnum),
        },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: Context) => {
        return await prisma.memberType.findUnique({ where: { id } });
      }
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_, __, { prisma }: Context) => {
        return await prisma.post.findMany();
      }
    },
    post: {
      type: PostType,
      args: {
        id: {
          description: 'id of the post',
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: Context) => {
        return await prisma.post.findUnique({ where: { id } });
      }
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_, __, { loaders }: Context, info) => {

        const parsedInfo = parseResolveInfo(info)?.fieldsByTypeName["User"];

        return loaders.user.all.load({
          fetchAuthors: !!parsedInfo?.["userSubscribedTo"],
          fetchSubs: !!parsedInfo?.["subscribedToUser"]
        });
      }
    },
    user: {
      type: UserType,
      args: {
        id: {
          description: 'id of the user',
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: Context) => {
        return await prisma.user.findUnique({ where: { id } });
      }
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (_, __, { prisma }) => {
        return await prisma.profile.findMany();
      }
    },
    profile: {
      type: ProfileType,
      args: {
        id: {
          description: 'id of the profile',
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: async (_, { id }: { id: string }, { prisma }) => {
        return await prisma.profile.findUnique({ where: { id } });
      }
    },
  }
})
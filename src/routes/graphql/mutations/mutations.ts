import { GraphQLObjectType, GraphQLNonNull, GraphQLInputObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLBoolean } from "graphql";
import { MemberTypeIdEnum } from "../types/MemberType.js";
import { PostType } from "../types/Post.js";
import { ProfileType } from "../types/Profile.js";
import { UserType } from "../types/User.js";
import { UUIDType } from "../types/uuid.js";
import { Context } from "../types.js";


export const mutation = new GraphQLObjectType({
  name: 'Mutations',
  fields: {
    createPost: {
      type: PostType,
      args: {
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'CreatePostInput',
            fields: {
              title: { type: new GraphQLNonNull(GraphQLString) },
              content: { type: new GraphQLNonNull(GraphQLString) },
              authorId: { type: new GraphQLNonNull(UUIDType) },
            },
          })),
        },
      },
      resolve: async (_, { dto }: {
        dto: {
          title: string;
          content: string;
          authorId: string
        }
      }, { prisma }: Context) => prisma.post.create({ data: dto }),
    },
    deletePost: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: Context) => {
        await prisma.post.delete({ where: { id } });
        return `Post ${id} deleted successfully.`;
      },
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'ChangePostInput',
            fields: {
              title: { type: GraphQLString },
              content: { type: GraphQLString },
            },
          })),
        },
      },
      resolve: (_, { id, dto }: {
        id: string;
        dto: { title?: string; content?: string }
      }, { prisma }: Context) => {
        return prisma.post.update({ where: { id }, data: dto });
      }
    },
    createUser: {
      type: UserType,
      args: {
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'CreateUserInput',
            fields: {
              name: { type: new GraphQLNonNull(GraphQLString) },
              balance: { type: new GraphQLNonNull(GraphQLFloat) },
            },
          })),
        },
      },
      resolve: async (_, { dto }: {
        dto: {
          name: string;
          balance: number;
        }
      }, { prisma }: Context) => prisma.user.create({ data: dto }),
    },
    deleteUser: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: Context) => {
        await prisma.user.delete({ where: { id } });

        return `User ${id} deleted successfully.`;
      },
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'ChangeUserInput',
            fields: {
              name: { type: GraphQLString },
              balance: { type: GraphQLFloat },
            },
          })),
        },
      },
      resolve: (_, { id, dto }: {
        id: string;
        dto: { name?: string; balance?: number }
      }, { prisma }: Context) => {
        return prisma.user.update({ where: { id }, data: dto })
      },
    },
    createProfile: {
      type: ProfileType,
      args: {
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'CreateProfileInput',
            fields: {
              yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
              userId: { type: new GraphQLNonNull(UUIDType) },
              isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
              memberTypeId: { type: new GraphQLNonNull(MemberTypeIdEnum) },
            },
          })),
        },
      },
      resolve: (_, { dto }: {
        dto: {
          yearOfBirth: number;
          userId: string;
          isMale: boolean;
          memberTypeId: string
        }
      }, { prisma }: Context) => prisma.profile.create({
        data: dto,
        include: { memberType: true },
      }),
    },
    deleteProfile: {
      type: GraphQLString,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { id }: { id: string }, { prisma }: Context) => {
        await prisma.profile.delete({ where: { id } });

        return `Profile ${id} deleted successfully.`;
      },
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: {
          type: new GraphQLNonNull(new GraphQLInputObjectType({
            name: 'ChangeProfileInput',
            fields: {
              isMale: { type: GraphQLBoolean },
              yearOfBirth: { type: GraphQLInt },
              memberTypeId: { type: MemberTypeIdEnum },
            },
          })),
        },
      },
      resolve: (_, { id, dto }: {
        id: string;
        dto: { isMale?: boolean; yearOfBirth?: number; memberTypeId?: string }
      }, { prisma }: Context) => {
        return prisma.profile.update({
          where: { id },
          data: dto,
          include: { memberType: true },
        });
      },
    },


    subscribeTo: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }: { userId: string, authorId: string }, { prisma }: Context) => {
        await prisma.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId: authorId,
          }
        })

        return 'Subscribed successfully';
      }
    },
    unsubscribeFrom: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_, { userId, authorId }: { userId: string, authorId: string }, { prisma }: Context) => {
        await prisma.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId: authorId,
            },
          }
        })

        return 'Subscribed successfully';
      }
    }
  }
});

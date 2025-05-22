import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLBoolean, GraphQLFloat, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { UUIDType } from './types/uuid.js';
import { MemberType, MemberTypeIdEnum } from './types/MemberType.js';
import { ProfileType } from './types/Profile.js';
import { UserType } from './types/User.js';
import { PostType } from './types/Post.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      return graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: { prisma }
      });
    },
  });


  const mutation = new GraphQLObjectType({
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
        }) => prisma.post.create({ data: dto }),
      },
      deletePost: {
        type: GraphQLString,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id: string }) => {
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
        }) => {
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
        }) => prisma.user.create({ data: dto }),
      },
      deleteUser: {
        type: GraphQLString,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id: string }) => {
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
        }) => {
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
        }) => prisma.profile.create({
          data: dto,
          include: { memberType: true },
        }),
      },
      deleteProfile: {
        type: GraphQLString,
        args: {
          id: { type: new GraphQLNonNull(UUIDType) },
        },
        resolve: async (_, { id }: { id: string }) => {
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
        }) => {
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
        resolve: async (_, { userId, authorId }: { userId: string, authorId: string }) => {
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
        resolve: async (_, { userId, authorId }: { userId: string, authorId: string }) => {
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

  const schema: GraphQLSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RootQuery',
      fields: {
        memberTypes: {
          type: new GraphQLList(MemberType),
          resolve: async () => {
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
          resolve: async (_, { id }: { id: string }) => {
            return await prisma.memberType.findUnique({ where: { id } });
          }
        },
        posts: {
          type: new GraphQLList(PostType),
          resolve: async () => {
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
          resolve: async (_, { id }: { id: string }) => {
            return await prisma.post.findUnique({ where: { id } });
          }
        },
        users: {
          type: new GraphQLList(UserType),
          resolve: async () => {
            return await prisma.user.findMany();
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
          resolve: async (_, { id }: { id: string }) => {
            return await prisma.user.findUnique({ where: { id } });
          }
        },
        profiles: {
          type: new GraphQLList(ProfileType),
          resolve: async () => {
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
          resolve: async (_, { id }: { id: string }) => {
            return await prisma.profile.findUnique({ where: { id } });
          }
        },
      }
    }),
    types: [MemberType, PostType, ProfileType, UserType, MemberTypeIdEnum],
    mutation: mutation
  });

};

export default plugin;


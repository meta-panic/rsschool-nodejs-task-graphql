import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { MemberType, MemberTypeIdEnum, PostType, ProfileType, UserType } from './types.js';
import { UUIDType } from './types/uuid.js';

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
        schema, source: req.body.query, variableValues: req.body.variables,
      });
    },
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
  });

};

export default plugin;


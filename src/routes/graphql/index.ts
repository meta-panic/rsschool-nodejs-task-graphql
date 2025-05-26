import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import depthLimit from 'graphql-depth-limit';
import { graphql, GraphQLSchema, parse, validate } from 'graphql';

import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { MemberType, MemberTypeIdEnum } from './types/MemberType.js';
import { ProfileType } from './types/Profile.js';
import { UserType } from './types/User.js';
import { PostType } from './types/Post.js';
import { createLoaders } from './loader/createLoaders.js';
import { mutation } from './mutations/mutations.js';
import { RootQuery } from './queries/rootQuery.js';


type GraphQLRequest = {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

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
    handler: async (request, reply) => {
      const { query, variables, operationName } = request.body as GraphQLRequest;
      const loaders = createLoaders(prisma);

      try {
        const ast = parse(query);

        const errors = validate(schema, ast, [depthLimit(5)]);
        if (errors.length > 0) {
          return reply.code(400).send({
            errors: errors.map((e) => ({
              message: e.message,
            })),
          });
        }

        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          operationName,
          contextValue: { prisma, loaders }
        });

        return result;
      } catch (err: unknown) {
        return reply.code(500).send({
          errors: [{ message: err instanceof Error ? err.message : "Unknown error" }],
        });
      }
    },
  });



  const schema: GraphQLSchema = new GraphQLSchema({
    query: RootQuery,
    types: [MemberType, PostType, ProfileType, UserType, MemberTypeIdEnum],
    mutation: mutation
  });

};

export default plugin;


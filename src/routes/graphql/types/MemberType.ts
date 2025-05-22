import { GraphQLEnumType, GraphQLObjectType, GraphQLFloat, GraphQLInt, GraphQLList } from "graphql";
import { Profile, ProfileType } from "./Profile.js";
import { Context } from "../types.js";

const MemberTypeIdEnum = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: {
      value: "BASIC",
      description: 'BASIC',
    },
    BUSINESS: {
      value: "BUSINESS",
      description: 'BUSINESS',
    },
  },
});

type MemberType = {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
}

const MemberType: GraphQLObjectType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: {
      type: MemberTypeIdEnum,
    },
    discount: {
      type: GraphQLFloat,
    },
    postsLimitPerMonth: {
      type: GraphQLInt,
    },
    profile: {
      type: new GraphQLList(ProfileType),
      resolve: async (memberType: MemberType, _, { prisma }: Context) => {
        return await prisma.profile.findMany({ where: { memberTypeId: memberType.id } });
      }
    },
  }),
});

export { MemberType, MemberTypeIdEnum }
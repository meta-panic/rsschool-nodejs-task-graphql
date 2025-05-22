import { GraphQLNonNull, GraphQLString, GraphQLEnumType, GraphQLFloat, GraphQLInt, GraphQLObjectType, GraphQLBoolean } from "graphql";
import { UUIDType } from "./types/uuid.js";

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
  }),
});



const PostType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
});

const UserType: GraphQLObjectType = new GraphQLObjectType({
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
      type: new GraphQLNonNull(ProfileType),
    },
    posts: {
      type: new GraphQLNonNull(PostType),
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(UserType),
    },
    subscribedToUser: {
      type: new GraphQLNonNull(UserType),
    },
  }),
});

const ProfileType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    memberType: {
      type: new GraphQLNonNull(MemberType),
    },
  }),
});


export { MemberType, PostType, UserType, ProfileType, MemberTypeIdEnum }
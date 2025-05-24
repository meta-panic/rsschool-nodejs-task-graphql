import { GraphQLObjectType, GraphQLNonNull, GraphQLBoolean, GraphQLInt } from "graphql";
import { UUIDType } from "./uuid.js";
import { MemberType } from "./MemberType.js";
import { Context } from "../types.js";


export type Profile = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

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
      resolve: async (profile: Profile, _, { loaders }: Context) => {
        return loaders.profile.memberTypes.load(profile.memberTypeId);
      }
    },
  }),
});

export { ProfileType } 

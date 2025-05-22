import { GraphQLObjectType, GraphQLNonNull, GraphQLString } from "graphql";
import { UUIDType } from "./uuid.js";

export type PostType = {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

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
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  }),
});

export { PostType }

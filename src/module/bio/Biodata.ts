import { Query } from "type-graphql";

export class BiodataResolver {
  @Query(() => String)
  async biodata() {
    return "biodata";
  }
}

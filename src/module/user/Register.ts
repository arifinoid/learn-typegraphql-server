import { Resolver, Query, Mutation, Arg } from "type-graphql";
import bycript from "bcryptjs";

import { User } from "../../entity/User";
import { RegisterInput } from "./register/RegisterInput";

@Resolver()
export class RegisterResolver {
  @Query(() => String)
  async hello() {
    return "Hello World";
  }

  @Mutation(() => User)
  async register(@Arg("data")
  {
    email,
    password,
    firstName,
    lastName
  }: RegisterInput): Promise<User> {
    const hashedPassword = await bycript.hash(password, 12);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword
    }).save();

    return user;
  }
}

import {
  Resolver,
  Mutation,
  Arg,
  ClassType,
  Field,
  InputType,
  UseMiddleware
} from "type-graphql";
import { Middleware } from "type-graphql/dist/interfaces/Middleware";

import { RegisterInput } from "./register/RegisterInput";
import { User } from "../../entity/User";
import { Product } from "../../entity/Product";

function createResolver<T extends ClassType, X extends ClassType>(
  suffix: string,
  returnType: T,
  inputType: X,
  entity: any,
  middleware?: Middleware<any>[]
) {
  @Resolver()
  class BaseResolver {
    @Mutation(() => returnType, { name: `create${suffix}` })
    @UseMiddleware(...(middleware || []))
    async create(@Arg("data", () => inputType) data: any) {
      return entity.create(data).save();
    }
  }

  return BaseResolver;
}

@InputType()
class ProductInput {
  @Field()
  name: string;
}

export const CreateUserResolver = createResolver(
  "User",
  User,
  RegisterInput,
  User
);
export const createProductResolver = createResolver(
  "Product",
  Product,
  ProductInput,
  Product
);

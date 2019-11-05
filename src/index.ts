import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";

import { RegisterResolver } from "./module/user/register";
import { redis } from "./redis";
import { LoginResolver } from "./module/user/Login";
import { MeResolver } from "./module/user/Me";
import { BiodataResolver } from "./module/bio/Biodata";
import { confirmUserResolver } from "./module/user/confirmUser";

const main = async () => {
  await createConnection();

  const schema = await buildSchema({
    resolvers: [
      MeResolver,
      RegisterResolver,
      LoginResolver,
      BiodataResolver,
      confirmUserResolver
    ]
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req }: any) => ({ req })
  });
  const app = Express();
  const PORT = 4000;

  const RedisStore = connectRedis(session);

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000"
    })
  );

  app.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: "qid",
      secret: "aslkdfjoiq12312",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365 // 7 years
      }
    })
  );

  apolloServer.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
};

main();

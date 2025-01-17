import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import Express from "express";
import { createConnection } from "typeorm";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";
import queryComplexity, {
  simpleEstimator,
  fieldConfigEstimator
} from "graphql-query-complexity";

import { redis } from "./redis";
import { createSchema } from "./utils/createSchema";

const main = async () => {
  await createConnection();

  const schema = await createSchema();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
    validationRules: [
      queryComplexity({
        maximumComplexity: 8,
        variables: {},
        onComplete: (complexity: number) =>
          console.log(`Query complexity: ${complexity}`),
        estimators: [
          fieldConfigEstimator(),
          simpleEstimator({ defaultComplexity: 1 })
        ]
      }) as any
    ]
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

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
};

main();

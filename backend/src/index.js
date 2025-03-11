import "dotenv/config";
import cors from "cors";
import session from "cookie-session";
import express from "express";
import { config } from "./config/app.config.js";
import connectDatabase from "./config/database.config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { HTTPSTATUS } from "./config/http.config.js";
import { asyncHandler } from "./middlewares/asyncHandler.middleware.js";
import { BadRequestException } from "./utils/appError.js";
import { ErrorCodeEnum } from "./enums/error-code.enum.js";

import "./config/passport.config.js";
import passport from "passport";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import isAuthenticated from "./middlewares/isAuthenticated.middleware.js";
import workspaceRoutes from "./routes/workspace.route.js";
import memberRoutes from "./routes/member.route.js";
import projectRoutes from "./routes/project.route.js";
import taskRoutes from "./routes/task.route.js";

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  `/`,
  asyncHandler(async (req, res, next) => {
    throw new BadRequestException(
      "This is a bad request",
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel & share",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});

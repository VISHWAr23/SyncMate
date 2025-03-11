import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { config } from "../config/app.config.js";
import { registerSchema } from "../validation/auth.validation.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { registerUserService } from "../services/auth.service.js";
import passport from "passport";

// Google Login Callback
export const googleLoginCallback = asyncHandler(async (req, res) => {
  const currentWorkspace = req.user?.currentWorkspace;

  if (!currentWorkspace) {
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
    );
  }

  return res.redirect(
    `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
  );
});

// Register User Controller
export const registerUserController = asyncHandler(async (req, res) => {
  const body = registerSchema.parse({
    ...req.body,
  });

  await registerUserService(body);

  return res.status(HTTPSTATUS.CREATED).json({
    message: "User created successfully",
  });
});

// Login Controller
export const loginController = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: info?.message || "Invalid email or password",
      });
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.status(HTTPSTATUS.OK).json({
        message: "Logged in successfully",
        user,
      });
    });
  })(req, res, next);
});

// Logout Controller
export const logOutController = asyncHandler(async (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res
        .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to log out" });
    }
  });

  req.session = null;
  return res
    .status(HTTPSTATUS.OK)
    .json({ message: "Logged out successfully" });
});
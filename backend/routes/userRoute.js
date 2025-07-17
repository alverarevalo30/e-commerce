import express from "express";
import {
  loginUser,
  registerUser,
  loginAdmin,
  logoutAdmin
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", loginAdmin);
userRouter.post("/logout", logoutAdmin);

export default userRouter;

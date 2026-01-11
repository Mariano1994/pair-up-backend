import express from "express";
import { auth } from "../middlewares/auth.ts";
import { deleteUserById } from "./delete-user-by-id.ts";
import { feed } from "./feed.ts";
import { getUserById } from "./get-user-by-id.ts";
import { logout } from "./logout.ts";
import { profile } from "./profile.ts";
import { register } from "./register.ts";
import { session } from "./session.ts";
import { updateUserProfile } from "./update-user-profile.ts";
import { userPasswordUpdate } from "./user-password-update.ts";

export const userRoutes = express.Router();

userRoutes.get("/feed", feed);
userRoutes.post("/register", register);
userRoutes.post("/login", session);
userRoutes.get("/users/:userId", getUserById);
userRoutes.delete("/users/:userId", deleteUserById);
userRoutes.post("/logout", logout);

//Authenticated Routes
userRoutes.put("/me/edit", auth, updateUserProfile);
userRoutes.get("/me", auth, profile);
userRoutes.put("/me/edit-password", auth, userPasswordUpdate);

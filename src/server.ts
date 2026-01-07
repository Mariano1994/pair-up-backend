import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import { register } from "../src/http/controllers/users/register.ts";
import connectDB from "./config/database.ts";
import { auth } from "./http/controllers/middlewares/auth.ts";
import { deleteUserById } from "./http/controllers/users/delete-user-by-id.ts";
import { feed } from "./http/controllers/users/feed.ts";
import { getUserById } from "./http/controllers/users/get-user-by-id.ts";
import { profile } from "./http/controllers/users/profile.ts";
import { session } from "./http/controllers/users/session.ts";
import { updateUserById } from "./http/controllers/users/update-user-by-id.ts";

const app = express();
app.use(express.json());
app.use(cookieParser());

// Signup endpoint - Create new user and save on database if the user not exists yet.
app.post("/register", register);
// Login endPoint
app.post("/login", session);
// Profile endpoint - Get the user profile
app.get("/me", auth, profile);
// Feed endpoint
app.get("/feed", feed);
// Get user by Id - Get a particular user according to given Id
app.get("/users/:userId", getUserById);
// Delete user by Id - Find a user by Id and delete from the database
app.delete("/users/:userId", deleteUserById);
// Update user by Id - Find a user by Id and update the user's information
app.put("/users/:userId", updateUserById);

connectDB()
	.then(() => {
		console.log("Database connected successfully");
		app.listen(3000, () => {
			console.log("server is running on port 3000");
		});
	})
	.catch((error: Error) => {
		console.log("Can not connecto to database", error.message);
	});

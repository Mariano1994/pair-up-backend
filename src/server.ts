import "dotenv/config";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import type { Request, Response } from "express";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import connectDB from "./config/database.ts";
import User from "./models/user.ts";
import { signupDataValidation } from "./utils/signup-data-validation.ts";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Signup endpoint - Create new user and save on database if the user not exists yet.
app.post("/signup", async (req: Request, res: Response) => {
	try {
		// This function validate if the data to create a new user attend all the requiments
		signupDataValidation(req, res);

		const {
			name,
			profissionalTitle,
			email,
			password,
			age,
			gender,
			photoUrl,
			about,
			skills,
		} = req.body;

		// Check if user already exists BEFORE creating User object
		const existingUser = await User.findOne({ email: email });

		if (existingUser) {
			return res.status(409).json({
				error: "User already exists",
				details: "A user with this email already exists",
			});
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		// Create and save user
		const userData = {
			name,
			profissionalTitle,
			email,
			password: hashedPassword,
			age,
			gender,
			photoUrl,
			about,
			skills,
		};

		const user = new User(userData);
		const savedUser = await user.save();

		res.status(201).json({
			message: "User created successfully",
			userId: savedUser._id,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to create user", details: errorMessage });
	}
});

// Login endPoint
app.post("/login", async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email: email });

		if (!user) {
			return res.status(401).json({
				message: "Credentials incorrect",
			});
		}

		// If the user exists, check if the password matches
		const doesPasswordMatch = await bcrypt.compare(password, user.password);
		if (!doesPasswordMatch) {
			return res.status(401).json({
				message: "Credentials incorrect",
			});
		}

		//create Token
		if (!process.env.SECRET_KEY_JWT) {
			return res.status(500).json({
				error: "Server configuration error",
			});
		}
		const token = await jwt.sign(
			{ sub: user?._id },
			process.env.SECRET_KEY_JWT,
		);

		//create Cookie
		res.cookie("Token", token);

		res.status(200).json({
			message: "Login successful",
			userId: user?._id,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res.status(500).json({ error: "Failed to login", details: errorMessage });
	}
});

// Profile endpoint - Get the user profile
app.get("/me", async (req: Request, res: Response) => {
	try {
		// Taken the token from cookies
		const { Token } = req.cookies;

		//checking the secret key jwt
		if (!process.env.SECRET_KEY_JWT) {
			return res.status(500).json({
				error: "Server configuration error",
			});
		}

		// compare the token if it's valid token from logged user
		const { sub } = await jwt.verify(Token, process.env.SECRET_KEY_JWT);

		const user = await User.findById(sub);

		if (!user) {
			return res.status(401).json({
				message: "User not found",
			});
		}

		res.status(200).json({
			user,
			message: "ok",
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(401)
			.json({ error: "Invalid or expired token", details: errorMessage });
	}
});

// Feed endpoint
app.get("/feed", async (_req: Request, res: Response) => {
	try {
		const users = await User.find();

		res.status(200).json({ users, quantity: users.length });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to get users", details: errorMessage });
	}
});

// Get user by Id - Get a particular user according to given Id
app.get("/users/:userId", async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;

		// Validate MongoDB ObjectId format
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ error: "Invalid user ID format" });
		}

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({ user });
	} catch (error) {
		console.error("Error fetching user:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to get user", details: errorMessage });
	}
});
// Delete user by Id - Find a user by Id and delete from the database
app.delete("/users/:userId", async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;

		// Validate MongoDB ObjectId format
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ error: "Invalid user ID format" });
		}

		// Delete user and check if it existed
		const deletedUser = await User.findByIdAndDelete(userId);

		if (!deletedUser) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({
			message: "User deleted successfully",
			userId: userId,
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to delete user", details: errorMessage });
	}
});

// Update user by Id - Find a user by Id and update the user's information
app.put("/users/:userId", async (req: Request, res: Response) => {
	const { userId } = req.params;
	const dataToUpdateInUser = req.body;

	try {
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(400).json({ error: "Invalid user ID format" });
		}

		if (["email"].every((key) => key in dataToUpdateInUser)) {
			return res.status(400).json({ error: "Email cannot be updated" });
		}

		const updatedUser = await User.findByIdAndUpdate(
			userId,
			dataToUpdateInUser,
			{
				runValidators: true,
			},
		);

		if (!updatedUser) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({
			message: "User updated successfully",
			userId: userId,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to update user", details: errorMessage });
	}
});

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

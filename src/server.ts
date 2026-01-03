import "dotenv/config";
import type { Request, Response } from "express";
import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/database.ts";
import User from "./models/user.ts";

const app = express();

app.use(express.json());

// Signup endpoint - Create new user and save on database if the user not exists yet.
app.post("/signup", async (req: Request, res: Response) => {
	try {
		const { firstName, lastName, email, password, age, gender } = req.body;

		// Validate required fields
		if (!firstName || !lastName || !email || !password) {
			return res.status(400).json({
				error: "Missing required fields",
				details: "firstName, lastName, email, and password are required",
			});
		}

		// Basic email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Validate age if provided
		if (age !== undefined && (typeof age !== "number" || age < 0)) {
			return res.status(400).json({
				error: "Invalid age",
				details: "Age must be a positive number",
			});
		}

		// Check if user already exists BEFORE creating User object
		const existingUser = await User.findOne({ email: email });

		if (existingUser) {
			return res.status(409).json({
				error: "User already exists",
				details: "A user with this email already exists",
			});
		}

		// Create and save user
		const userData = {
			firstName,
			lastName,
			email,
			password,
			age,
			gender,
		};

		const user = new User(userData);
		const savedUser = await user.save();

		res.status(201).json({
			message: "User created successfully",
			userId: savedUser._id,
		});
	} catch (error) {
		console.error("Error creating user:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to create user", details: errorMessage });
	}
});

// Feed Endpoint - Get all the users from database
app.get("/feed", async (_req: Request, res: Response) => {
	try {
		const users = await User.find();

		res.status(200).json({ users, quantity: users.length });
	} catch (error) {
		console.error("Error fetching users:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to get users", details: errorMessage });
	}
});

// Get user by Id - Get a particular user according to given Id
app.get("/users/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Validate MongoDB ObjectId format
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid user ID format" });
		}

		const user = await User.findById(id);

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
app.delete("/users/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		// Validate MongoDB ObjectId format
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid user ID format" });
		}

		// Delete user and check if it existed
		const deletedUser = await User.findByIdAndDelete(id);

		if (!deletedUser) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({
			message: "User deleted successfully",
			userId: id,
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
app.put("/users/:id", async (req: Request, res: Response) => {
	const { id } = req.params;
	const userData = req.body;

	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ error: "Invalid user ID format" });
		}
		const updatedUser = await User.findByIdAndUpdate(id, userData);

		if (!updatedUser) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json({
			message: "User updated successfully",
			userId: id,
		});
	} catch (error) {
		console.error("Error updating user:", error);
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

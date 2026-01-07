import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import User from "../../../models/user.ts";
import { signupDataValidation } from "../../../utils/signup-data-validation.ts";

export async function register(req: Request, res: Response) {
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
}

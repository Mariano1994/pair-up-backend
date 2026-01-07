import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../../models/user.ts";

export async function session(req: Request, res: Response) {
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
}

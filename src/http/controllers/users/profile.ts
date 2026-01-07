import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../../models/user.ts";

export async function profile(req: Request, res: Response) {
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
}

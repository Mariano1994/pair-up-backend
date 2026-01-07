import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Document } from "mongoose";
import User from "../../../models/user.ts";

declare global {
	namespace Express {
		interface Request {
			user: Document;
		}
	}
}
export async function auth(req: Request, res: Response, next: NextFunction) {
	try {
		const { Token } = req.cookies;

		if (!process.env.SECRET_KEY_JWT) {
			return res.status(500).json({
				error: "Server configuration error",
			});
		}

		const { sub } = jwt.verify(Token, process.env.SECRET_KEY_JWT);

		const user = await User.findById(sub);

		if (!user) {
			return res.status(401).json({
				message: "User not found",
			});
		}
		req.user = user;
		next();
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(401)
			.json({ error: "Invalid or expired token", details: errorMessage });
	}
}

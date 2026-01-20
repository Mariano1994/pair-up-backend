import type { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../../models/user.ts";
export async function getUserById(req: Request, res: Response) {
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
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to get user", details: errorMessage });
	}
}

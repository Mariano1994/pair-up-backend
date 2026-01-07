import type { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../../models/user.ts";

export async function updateUserById(req: Request, res: Response) {
	try {
		const { userId } = req.params;
		const dataToUpdateInUser = req.body;

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
}

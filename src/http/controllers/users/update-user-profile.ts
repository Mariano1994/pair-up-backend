import type { Request, Response } from "express";
import User from "../../../models/user.ts";

export async function updateUserProfile(req: Request, res: Response) {
	try {
		const dataToUpdateInUser = req.body;

		const invalidEditFilds = ["email", "password"];

		if (invalidEditFilds.every((key) => key in dataToUpdateInUser)) {
			return res.status(400).json({ error: " Email cannot be updated" });
		}

		const { user } = req;

		const updatedUser = await User.findByIdAndUpdate(
			user._id,
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
			userId: user._id,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to update user", details: errorMessage });
	}
}

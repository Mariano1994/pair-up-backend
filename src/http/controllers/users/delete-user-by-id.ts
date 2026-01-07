import type { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../../models/user.ts";

export async function deleteUserById(req: Request, res: Response) {
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
}

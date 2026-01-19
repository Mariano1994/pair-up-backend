import type { Request, Response } from "express";
import mongoose from "mongoose";
import ConnectionRequest from "../../../models/connection-request.ts";
import User from "../../../models/user.ts";

export async function sendRequestConnection(req: Request, res: Response) {
	try {
		const { toUserId } = req.params;
		const fromUserId = req.user._id;

		if (!mongoose.Types.ObjectId.isValid(toUserId)) {
			return res.status(500).json({ message: "Invalid user ID format " });
		}

		if (toUserId === fromUserId.toString()) {
			return res
				.status(409)
				.json({ message: "You can not send connection request to yourself" });
		}

		const user = await User.findById(toUserId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const existingConnection = await ConnectionRequest.findOne({
			$or: [
				{ fromUserId, toUserId },
				{ fromUserId: toUserId, toUserId: fromUserId },
			],
		} as Record<string, unknown>);

		if (existingConnection) {
			return res
				.status(409)
				.json({ message: "Already exist a connection request with this user" });
		}

		const connectionData = { toUserId, fromUserId };
		const connectionRequest = new ConnectionRequest(connectionData);

		const connection = await connectionRequest.save();

		res
			.status(200)
			.json({ message: "Connection request sent successfully", connection });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknow error";

		res.status(500).json({
			error: "Failed to send connection request",
			details: errorMessage,
		});
	}
}

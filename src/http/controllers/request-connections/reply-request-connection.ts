import type { Request, Response } from "express";
import mongoose from "mongoose";
import ConnectionRequest from "../../../models/connection-request.ts";

export async function replayRequestConnection(req: Request, res: Response) {
	try {
		const { connectionId } = req.params;
		const { status } = req.params;
		const { user } = req;
		const validStatusValues = ["accepted", "rejected"];

		if (!mongoose.Types.ObjectId.isValid(connectionId)) {
			return res.status(500).json({ message: "Invalid Id format" });
		}

		if (!validStatusValues.includes(status)) {
			return res.status(500).json({ message: "Status invalid" });
		}
		const connectionRequest = await ConnectionRequest.findById(connectionId);

		if (!connectionRequest) {
			return res.status(404).json({ message: "Request connection not found" });
		}

		if (connectionRequest.toUserId.toString() !== user._id.toString()) {
			return res.status(401).json({ message: "Unautorized" });
		}

		if (status === "accepted") {
			connectionRequest.status = "accepted";
		} else {
			connectionRequest.status = "rejected";
		}

		await connectionRequest.save();

		res.status(200).json({ message: `Connection request ${status}` });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res.status(500).json({
			error: "Failed to fetch my projects",
			details: errorMessage,
		});
	}
}

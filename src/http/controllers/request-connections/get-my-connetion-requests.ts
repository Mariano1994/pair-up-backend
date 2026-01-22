import type { Request, Response } from "express";
import mongoose from "mongoose";
import ConnectionRequest from "../../../models/connection-request.ts";

export async function getMyConnectionRequest(req: Request, res: Response) {
	try {
		const { user } = req;

		const connectionRequest = await ConnectionRequest.find({
			toUserId: new mongoose.Types.ObjectId(user._id.toString()),
			status: "pendding",
		} as Record<string, unknown>).populate("fromUserId", [
			"name",
			"age",
			"profissionalTitle",
			"photoUrl",
			"skill",
			"about",
		]);

		res
			.status(200)
			.json({ connectionRequest, quantity: connectionRequest.length });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res.status(500).json({
			error: "Failed to get connections requests",
			details: errorMessage,
		});
	}
}

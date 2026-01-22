import type { Request, Response } from "express";
import mongoose from "mongoose";
import ConnectionRequest from "../../../models/connection-request.ts";

export async function getMyConnetions(req: Request, res: Response) {
	try {
		const { user } = req;

		const connections = await ConnectionRequest.find({
			toUserId: new mongoose.Types.ObjectId(user._id.toString()),
			status: "accepted",
		} as Record<string, unknown>).populate("fromUserId", [
			"name",
			"age",
			"profissionalTitle",
			"photoUrl",
			"skill",
			"about",
		]);

		res.status(200).json({ connections, quantity: connections.length });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res.status(500).json({
			error: "Failed to get connections",
			details: errorMessage,
		});
	}
}

import type { Request, Response } from "express";
import User from "../../../models/user.ts";

export async function feed(_req: Request, res: Response) {
	try {
		const users = await User.find();

		res.status(200).json({ users, quantity: users.length });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to get users", details: errorMessage });
	}
}

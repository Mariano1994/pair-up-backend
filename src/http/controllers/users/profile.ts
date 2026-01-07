import type { Request, Response } from "express";
export async function profile(req: Request, res: Response) {
	try {
		const { user } = req;

		res.status(200).json({
			user,
			message: "ok",
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(401)
			.json({ error: "Invalid or expired token", details: errorMessage });
	}
}

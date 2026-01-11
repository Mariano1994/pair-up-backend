import type { Request, Response } from "express";

export function logout(_req: Request, res: Response) {
	try {
		res.clearCookie("Token", { httpOnly: true });
		return res.status(200).json({
			message: "Logout successful",
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		return res.status(500).json({
			error: "Failed to logout",
			details: errorMessage,
		});
	}
}

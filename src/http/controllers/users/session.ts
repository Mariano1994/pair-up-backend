import type { Request, Response } from "express";
import User from "../../../models/user.ts";

export async function session(req: Request, res: Response) {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email: email });

		if (!user) {
			return res.status(401).json({
				message: "Credentials incorrect",
			});
		}

		await user.validateCredentials(password, user.password);

		//Asign Token Or create token
		const token = await user.getJWTToken();

		//Create Cookie
		res.cookie("Token", token, { httpOnly: true });

		res.status(200).json({
			message: "Login successful",
			userId: user?._id,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res.status(500).json({ error: "Failed to login", details: errorMessage });
	}
}

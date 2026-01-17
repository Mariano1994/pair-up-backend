import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import validator from "validator";
// import User from "../../../models/user.ts";
export async function UpdateUserPassword(req: Request, res: Response) {
	try {
		const { newPassword, currentPassword } = req.body;
		const { user } = req;

		const doesPasswordMacth = await bcrypt.compare(
			currentPassword,
			user.password,
		);

		if (!doesPasswordMacth) {
			res.status(400).json({
				message: "Ivalidad Password",
			});
		}

		const isPasswordStrong = validator.isStrongPassword(newPassword);

		if (!isPasswordStrong) {
			res.status(400).json({
				message: "Password must be strong",
			});
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;

		await user.save();

		res.status(200).json({
			message: "password updated successesfully",
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

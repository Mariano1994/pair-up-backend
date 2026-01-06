import type { Request, Response } from "express";
import validator from "validator";

export const signupDataValidation = (req: Request, res: Response) => {
	const { name, email, password, age, gender } = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({ error: "Missing required fields" });
	}

	if (!validator.isEmail(email)) {
		return res.status(400).json({ error: "Invalid email format" });
	}

	if (!validator.isStrongPassword(password)) {
		return res.status(400).json({ error: "Invalid password format" });
	}

	if (!validator.isInt(age.toString(), { min: 18 })) {
		return res.status(400).json({ error: "Invalid age format" });
	}

	if (!validator.isIn(gender, ["male", "female", "other"])) {
		return res.status(400).json({ error: "Invalid gender format" });
	}

	return true;
};

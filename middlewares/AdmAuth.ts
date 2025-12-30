import type { NextFunction, Request, Response } from "express";

const auth = (_req: Request, res: Response, next: NextFunction) => {
	const token = "authenticated";

	if (token === "authenticated") {
		next();
	} else {
		res.send("Unautorized");
	}
};

module.exports = { auth };

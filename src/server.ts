import "dotenv/config";
import type { Request, Response } from "express";
import express from "express";
import connectDB from "./config/database.ts";
import User from "./models/user.ts";

const app = express();

app.use(express.json());

app.post("/signup", async (req: Request, res: Response) => {
	try {
		const { firstName, lastName, email, password, age, gender } = req.body;

		const userData = {
			firstName,
			lastName,
			email,
			password,
			age,
			gender,
		};

		const user = new User(userData);

		const exitingUser = await User.findOne({ email: email });

		if (exitingUser) {
			throw new Error("user already exits");
		}

		await user.save();

		res.status(201).send("User creates succssfully");
	} catch (error) {
		res.status(400).send(error.message);
	}
});

connectDB()
	.then(() => {
		console.log("Database connected successfully");
		app.listen(3000, () => {
			console.log("server is running on port 3000");
		});
	})
	.catch((error: Error) => {
		console.log("Can not connecto to database", error.message);
	});

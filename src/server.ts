import "dotenv/config";
import type { Request, Response } from "express";
import express from "express";
import connectDB from "./config/database.ts";
import User from "./models/user.ts";

const app = express();

app.use(express.json());

// Signup endpoint - Create new user and save on database if the user not exits yet.
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

// Feed Endpoint - Get all the user from database
app.get("/feed", async (_req: Request, res: Response) => {
	try {
		const users = await User.find();

		res.status(200).send({ users, quantity: users.length });
	} catch (error) {
		res.status(400).send(`fail to get users ${error.message}`);
	}
});

// Get user by Id - Get a particular user according to given Id
app.get("/users/:id", async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		if (!user) {
			throw new Error("User not found");
		}

		res.status(200).send({ user });
	} catch (error) {
		res.send(error.message);
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

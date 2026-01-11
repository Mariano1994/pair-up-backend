import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import connectDB from "./config/database.ts";
import { userRoutes } from "./http/controllers/users/routes.ts";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/", userRoutes);

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

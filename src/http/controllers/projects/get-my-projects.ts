import type { Request, Response } from "express";
import mongoose from "mongoose";
import Project from "../../../models/project.ts";

export async function getMyProjects(req: Request, res: Response) {
	try {
		const { user } = req;

		const authorId = new mongoose.Types.ObjectId(user._id);
		const myProjects = await Project.find({
			authorId,
		});

		// const myProjects = projects.filter(
		// 	(project) => project.authorId.toString() === user._id.toString(),
		// );

		res.status(200).json({ myProjects, quantity: myProjects.length });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to fetch my projects", details: errorMessage });
	}
}

import type { Request, Response } from "express";
import Project from "../../../models/project.ts";

export async function create(req: Request, res: Response) {
	try {
		const {
			title,
			category,
			description,
			coverPhoto,
			status,
			colaboratorsIds,
		} = req.body;

		if (!title) {
			throw new Error("Title is a required field");
		}

		const user = req.user;

		const newProjectData = {
			title,
			authorId: user._id,
			category,
			description,
			coverPhoto,
			status,
			colaboratorsIds,
		};
		const newProject = new Project(newProjectData);
		const savedProject = await newProject.save();

		res.status(201).json({
			message: "Project created successfully",
			projectId: savedProject._id,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to create project", details: errorMessage });
	}
}

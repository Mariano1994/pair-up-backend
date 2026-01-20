import type { Request, Response } from "express";
import Project from "../../../models/project.ts";

export async function projectFeed(_req: Request, res: Response) {
	try {
		const projects = await Project.find();

		res.status(200).json({ projects, quantity: projects.length });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknow error occurred";

		res
			.status(500)
			.json({ error: "Failed to get projects", details: errorMessage });
	}
}

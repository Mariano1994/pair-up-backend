import type { Request, Response } from "express";
import mongoose from "mongoose";
import Project from "../../../models/project.ts";
export async function getProjectById(req: Request, res: Response) {
	try {
		const { projectId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(projectId)) {
			return res.status(400).json({ message: "Invalid Project Id format" });
		}

		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		}

		res.status(200).json({ project });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknow error accurred";

		res
			.status(500)
			.json({ error: "Failed to get  project", details: errorMessage });
	}
}

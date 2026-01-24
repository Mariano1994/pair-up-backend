import type { Request, Response } from "express";
import mongoose from "mongoose";
import Project from "../../../models/project.ts";

export async function UpdateProjectInfo(req: Request, res: Response) {
	try {
		const { projectId } = req.params;
		const dataToUpdate = req.body;
		const { user } = req;

		if (!mongoose.Types.ObjectId.isValid(projectId)) {
			return res.status(400).json({ message: "Invalid project id format" });
		}

		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		}

		if (user._id.toString() !== project.authorId.toString()) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		await Project.findByIdAndUpdate(project._id, dataToUpdate, {
			runValidators: true,
		});

		res.status(200).json({
			message: "project updated successfully",
			projectId: project._id,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to update project", details: errorMessage });
	}
}

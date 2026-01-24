import type { Request, Response } from "express";
import mongoose from "mongoose";
import { CollaborationRequest } from "../../../models/collaboration-request.ts";
import Project from "../../../models/project.ts";

export async function sendCollaborationRequest(req: Request, res: Response) {
	try {
		const { user } = req;
		const { projectId } = req.params;

		const collaboratorId = new mongoose.Types.ObjectId(user._id);

		if (!mongoose.Types.ObjectId.isValid(projectId)) {
			return res.status(400).json({ message: "Ivalid project id format" });
		}

		const project = await Project.findOne({
			$or: [
				{
					_id: projectId,
					status: "not started",
				},
				{
					_id: projectId,
					status: "in progress",
				},
			],
		});

		if (!project) {
			return res
				.status(404)
				.json({ message: "This project is already finished or canceled" });
		}

		if (project.authorId.toString() === user._id.toString()) {
			return res
				.status(400)
				.json({ message: "Failed to send collaboration request" });
		}

		const existingCollaboration = await CollaborationRequest.findOne({
			collaboratorId,
		} as Record<string, unknown>);

		if (existingCollaboration) {
			return res.status(409).json({
				message: "You already sent request to collaborate in this project",
			});
		}

		const collaborationRequestData = {
			collaboratorId,
			projectId,
		};

		const collaborationRequest = new CollaborationRequest(
			collaborationRequestData,
		);

		const collaboration = await collaborationRequest.save();
		res
			.status(201)
			.json({ collaboration, message: "Collaboration send succssfully" });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unkonw error accurred";

		res.status(500).json({
			error: "Failed to send collaboration request",
			details: errorMessage,
		});
	}
}

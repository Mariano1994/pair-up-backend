import type { Request, Response } from "express";
import mongoose from "mongoose";
import { CollaborationRequest } from "../../../models/collaboration-request.ts";
import Project from "../../../models/project.ts";
import User from "../../../models/user.ts";

export async function replyCollaborationRequest(req: Request, res: Response) {
	try {
		const { user } = req;
		const { status, collaborationRequestId } = req.params;

		const validStatusValues = ["accepted", "rejected"];

		if (!mongoose.Types.ObjectId.isValid(collaborationRequestId)) {
			return res.status(400).json({ message: "Invalid id formart" });
		}

		if (!validStatusValues.includes(status)) {
			return res.status(400).json({ message: "Invalid status value" });
		}

		const collaborationRequest = await CollaborationRequest.findById(
			collaborationRequestId,
		);

		if (!collaborationRequest) {
			return res.status(404).json({ message: "Request not found" });
		}

		const project = await Project.findById(collaborationRequest.projectId);

		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		}

		if (project?.authorId.toString() !== user._id.toString()) {
			return res.status(401).json({ message: "Unautorized" });
		}

		if (status === "accepted") {
			const collaboratorData = await User.findById(
				collaborationRequest.collaboratorId,
			);

			if (!collaboratorData) return;
			const colaborator = {
				name: collaboratorData.name,
				photoUrl: collaboratorData.photoUrl,
				about: collaboratorData.about,
				profissionalTitle: collaboratorData.profissionalTitle,
			};

			project.collaborators = [...project.collaborators, colaborator];

			collaborationRequest.status = "accepted";
			await project?.save();
		} else {
			collaborationRequest.status = "rejected";
		}

		await collaborationRequest.save();

		res.status(200).json({ message: `Request ${status} successfully` });
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unkonw error accurred";

		res.status(500).json({
			error: "Failed to send collaboration request",
			details: errorMessage,
		});
	}
}

import type { Request, Response } from "express";
import mongoose from "mongoose";
import { CollaborationRequest } from "../../../models/collaboration-request.ts";
import Project from "../../../models/project.ts";
import User from "../../../models/user.ts";

export async function replyCollaborationRequest(req: Request, res: Response) {
	const validStatusValues = ["accepted", "rejected"] as const;
	const isValidReplyStatus = (
		value: string,
	): value is (typeof validStatusValues)[number] => {
		return (validStatusValues as readonly string[]).includes(value);
	};

	let session: mongoose.ClientSession | null = null;
	try {
		const { user } = req;
		const { status: statusParam, collaborationRequestId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(collaborationRequestId)) {
			return res.status(400).json({ message: "Invalid id format" });
		}

		if (!isValidReplyStatus(statusParam)) {
			return res.status(400).json({ message: "Invalid status value" });
		}
		const status = statusParam;

		session = await mongoose.startSession();
		const s = session;
		let didMutate = false;

		await s.withTransaction(async () => {
			const collaborationRequest = await CollaborationRequest.findById(
				collaborationRequestId,
			).session(s);

			if (!collaborationRequest) {
				res.status(404).json({ message: "Request not found" });
				return;
			}

			const project = await Project.findById(
				collaborationRequest.projectId,
			).session(s);

			if (!project) {
				res.status(404).json({ message: "Project not found" });
				return;
			}

			// Only the project author can accept/reject collaboration requests.
			if (project.authorId.toString() !== user._id.toString()) {
				res.status(403).json({ message: "Unauthorized" });
				return;
			}

			// Allow only a single transition from "pendding" to final status.
			// Keep typo "pendding" to match current schema enum.
			if (collaborationRequest.status !== "pendding") {
				if (collaborationRequest.status === status) {
					res.status(200).json({ message: `Request ${status} successfully` });
					return;
				}

				res.status(409).json({
					message: `Request already ${collaborationRequest.status}`,
				});
				return;
			}

			if (status === "accepted") {
				const collaboratorData = await User.findById(
					collaborationRequest.collaboratorId,
				).session(s);

				if (!collaboratorData) {
					res.status(404).json({ message: "Collaborator not found" });
					return;
				}

				const collaborator = {
					name: collaboratorData.name,
					photoUrl: collaboratorData.photoUrl ?? null,
					about: collaboratorData.about ?? null,
					profissionalTitle: collaboratorData.profissionalTitle ?? null,
				};

				// Prevent duplicate additions when the endpoint is retried.
				await Project.updateOne(
					{ _id: project._id },
					{ $addToSet: { collaborators: collaborator } },
					{ session: s },
				);
			}

			collaborationRequest.status = status;
			await collaborationRequest.save({ session: s });
			didMutate = true;
		});

		if (!res.headersSent) {
			// In case transaction exits without sending (shouldn't happen), respond consistently.
			return res.status(didMutate ? 200 : 500).json({
				message: didMutate ? `Request ${status} successfully` : "Failed",
			});
		}
		return;
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";

		res.status(500).json({
			error: "Failed to reply to collaboration request",
			details: errorMessage,
		});
	} finally {
		await session?.endSession();
	}
}

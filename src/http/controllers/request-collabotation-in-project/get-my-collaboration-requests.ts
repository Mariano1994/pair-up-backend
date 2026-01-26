import type { Request, Response } from "express";
import { CollaborationRequest } from "../../../models/collaboration-request.ts";
import Project from "../../../models/project.ts";

export async function getMyCollaborationRequests(req: Request, res: Response) {
	try {
		const { user } = req;

		// Find all collaboration requests sent by the logged user
		const collaborationRequests = await CollaborationRequest.find({
			collaboratorId: user._id,
		} as Record<string, unknown>)

		if (!collaborationRequests || collaborationRequests.length === 0) {
			return res.status(200).json({
				requests: [],
				message: "No collaboration requests found",
			});
		}

		// Get project IDs from the requests
		const projectIds = collaborationRequests.map(
			(request) => request.projectId,
		);

		// Fetch all projects
		const projects = await Project.find({
			_id: { $in: projectIds },
		} as Record<string, unknown>);

		// Create a map of projectId to project for quick lookup
		const projectMap = new Map(
			projects.map((project) => [project._id.toString(), project]),
		);

		// Combine collaboration requests with their corresponding projects
		const requestsWithProjects = collaborationRequests.map((request) => {
			const project = projectMap.get(request.projectId.toString());
			const requestDoc = request as typeof request & {
				createdAt: Date;
				updatedAt: Date;
			};
			const projectDoc = project as typeof project & {
				createdAt: Date;
				updatedAt: Date;
			} | null;

			return {
				requestId: request._id,
				status: request.status,
				createdAt: requestDoc.createdAt,
				updatedAt: requestDoc.updatedAt,
				project: projectDoc
					? {
							_id: projectDoc._id,
							title: projectDoc.title,
							category: projectDoc.category,
							description: projectDoc.description,
							coverPhoto: projectDoc.coverPhoto,
							status: projectDoc.status,
							authorId: projectDoc.authorId,
							createdAt: projectDoc.createdAt,
							updatedAt: projectDoc.updatedAt,
						}
					: null,
			};
		});

		res.status(200).json({
			requests: requestsWithProjects,
			total: requestsWithProjects.length,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";

		res.status(500).json({
			error: "Failed to get collaboration requests",
			details: errorMessage,
		});
	}
}

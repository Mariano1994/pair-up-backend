import type { Request, Response } from "express";
import mongoose from "mongoose";
import { CollaborationRequest } from "../../../models/collaboration-request.ts";
import Project from "../../../models/project.ts";

export async function projectFeed(req: Request, res: Response) {
	try {
		const { user } = req;
		const loggedUserId = new mongoose.Types.ObjectId(user._id);

		// Find all collaboration requests involving the logged-in user
		// This includes both accepted collaborations and pending requests sent by the user
		const collaborationRequests = await CollaborationRequest.find({
			collaboratorId: loggedUserId,
		} as Record<string, unknown>);

		// Build set of project IDs that should NOT appear in the feed
		const excludedProjectIds = new Set<string>();

		// Exclude projects where the logged-in user sent collaboration requests
		// (regardless of status - pending, accepted, or rejected)
		for (const request of collaborationRequests) {
			excludedProjectIds.add(request.projectId.toString());
		}

		// Convert excluded project IDs to ObjectId array
		const excludedObjectIds = Array.from(excludedProjectIds).map(
			(id) => new mongoose.Types.ObjectId(id),
		);

		// Infinite scroll - cursor-based pagination
		const limit =
			typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 20;
		const safeLimit = Number.isNaN(limit) || limit < 1 ? 20 : limit;

		// Build query for infinite scroll
		// Exclude: user's own projects, projects with collaboration requests from user
		const query: Record<string, unknown> = {
			authorId: { $ne: loggedUserId }, // Exclude user's own projects
			_id: { $nin: excludedObjectIds }, // Exclude projects with collaboration requests
		};

		// If cursor is provided, fetch projects after that cursor (for next page)
		if (req.query.cursor) {
			const cursorId = req.query.cursor as string;
			if (mongoose.Types.ObjectId.isValid(cursorId)) {
				query._id = {
					$nin: excludedObjectIds,
					$gt: new mongoose.Types.ObjectId(cursorId),
				};
			}
		}

		// Fetch projects with limit + 1 to check if there are more results
		const projects = await Project.find(query)
			.sort({ _id: 1 }) // Sort by _id ascending for consistent ordering
			.limit(safeLimit + 1); // Fetch one extra to check if there's a next page

		// Check if there are more results
		const hasMore = projects.length > safeLimit;
		const projectsToReturn = hasMore ? projects.slice(0, safeLimit) : projects;

		// Get the cursor for the next page (last project's _id)
		const nextCursor =
			hasMore && projectsToReturn.length > 0
				? projectsToReturn[projectsToReturn.length - 1]._id.toString()
				: null;

		res.status(200).json({
			projects: projectsToReturn,
			quantity: projectsToReturn.length,
			nextCursor,
			hasMore,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";

		res
			.status(500)
			.json({ error: "Failed to get projects", details: errorMessage });
	}
}

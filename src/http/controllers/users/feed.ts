import type { Request, Response } from "express";
import mongoose from "mongoose";
import ConnectionRequest from "../../../models/connection-request.ts";
import User from "../../../models/user.ts";

export async function feed(req: Request, res: Response) {
	try {
		const { user } = req;
		const loggedUserId = new mongoose.Types.ObjectId(user._id);

		// Find all accepted connections involving the logged-in user
		const connections = await ConnectionRequest.find({
			$or: [
				{ toUserId: loggedUserId, status: "accepted" },
				{ fromUserId: loggedUserId, status: "accepted" },
			],
		} as Record<string, unknown>);

		// Find all pending connection requests involving the logged-in user
		const pendingRequests = await ConnectionRequest.find({
			$or: [
				{ fromUserId: loggedUserId, status: "pendding" },
				{ toUserId: loggedUserId, status: "pendding" },
			],
		} as Record<string, unknown>);

		// Build set of user IDs that should NOT appear in the feed
		const excludedUserIds = new Set<string>();
		// Do not show the logged-in user
		excludedUserIds.add(loggedUserId.toString());

		// Exclude users that are already connected
		for (const connection of connections) {
			const fromId = connection.fromUserId.toString();
			const toId = connection.toUserId.toString();

			if (fromId === loggedUserId.toString()) {
				excludedUserIds.add(toId);
			} else if (toId === loggedUserId.toString()) {
				excludedUserIds.add(fromId);
			}
		}

		// Exclude users involved in pending connection requests
		// - Users that the logged-in user has sent requests to (fromUserId === loggedUserId)
		// - Users that have sent requests to the logged-in user (toUserId === loggedUserId)
		for (const request of pendingRequests) {
			const fromId = request.fromUserId.toString();
			const toId = request.toUserId.toString();

			if (fromId === loggedUserId.toString()) {
				// Logged-in user sent request to this user
				excludedUserIds.add(toId);
			} else if (toId === loggedUserId.toString()) {
				// This user sent request to logged-in user
				excludedUserIds.add(fromId);
			}
		}

		const excludedObjectIds = Array.from(excludedUserIds).map(
			(id) => new mongoose.Types.ObjectId(id),
		);

		// Infinite scroll - cursor-based pagination
		const limit =
			typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 20;
		const safeLimit = Number.isNaN(limit) || limit < 1 ? 20 : limit;

		// Build query for infinite scroll
		const query: Record<string, unknown> = {
			_id: { $nin: excludedObjectIds },
		};

		// If cursor is provided, fetch users after that cursor (for next page)
		if (req.query.cursor) {
			const cursorId = req.query.cursor as string;
			if (mongoose.Types.ObjectId.isValid(cursorId)) {
				query._id = {
					$nin: excludedObjectIds,
					$gt: new mongoose.Types.ObjectId(cursorId),
				};
			}
		}

		// Fetch users with limit + 1 to check if there are more results
		const users = await User.find(query)
			.sort({ _id: 1 }) // Sort by _id ascending for consistent ordering
			.limit(safeLimit + 1); // Fetch one extra to check if there's a next page

		// Check if there are more results
		const hasMore = users.length > safeLimit;
		const usersToReturn = hasMore ? users.slice(0, safeLimit) : users;

		// Get the cursor for the next page (last user's _id)
		const nextCursor =
			hasMore && usersToReturn.length > 0
				? usersToReturn[usersToReturn.length - 1]._id.toString()
				: null;

		res.status(200).json({
			users: usersToReturn,
			quantity: usersToReturn.length,
			nextCursor,
			hasMore,
		});
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error occurred";
		res
			.status(500)
			.json({ error: "Failed to get users", details: errorMessage });
	}
}

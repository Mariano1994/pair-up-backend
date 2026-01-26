import express from "express";
import { auth } from "../middlewares/auth.ts";
import { getMyCollaborationRequests } from "./get-my-collaboration-requests.ts";
import { replyCollaborationRequest } from "./reply-collaboration-request.ts";
import { sendCollaborationRequest } from "./send-collaboration-request.ts";

export const collaborationRoutes = express.Router();

collaborationRoutes.post(
	"/collaboration/request/send/:projectId",
	auth,
	sendCollaborationRequest,
);

collaborationRoutes.post(
	"/collaboration/request/:status/:collaborationRequestId",
	auth,
	replyCollaborationRequest,
);

collaborationRoutes.get(
	"/collaboration/request/my-requests",
	auth,
	getMyCollaborationRequests,
);

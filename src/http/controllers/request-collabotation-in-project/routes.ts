import express from "express";
import { auth } from "../middlewares/auth.ts";
import { sendCollaborationRequest } from "./send-collaboration-request.ts";

export const collaborationRoutes = express.Router();

collaborationRoutes.post(
	"/collaboration/request/send/:projectId",
	auth,
	sendCollaborationRequest,
);

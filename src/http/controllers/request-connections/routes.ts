import express from "express";
import { auth } from "../middlewares/auth.ts";
import { getMyConnetions } from "./get-my-connections.ts";
import { replayRequestConnection } from "./reply-request-connection.ts";
import { sendRequestConnection } from "./send-request-connection.ts";

export const requestConnectionRoutes = express.Router();

requestConnectionRoutes.post(
	"/request/connection/send/:toUserId",
	auth,
	sendRequestConnection,
);

requestConnectionRoutes.post(
	"/request/connection/:status/:connectionId",
	auth,
	replayRequestConnection,
);
requestConnectionRoutes.get(
	"/request/connection/my-connections",
	auth,
	getMyConnetions,
);

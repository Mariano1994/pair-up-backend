import express from "express";
import { auth } from "../middlewares/auth.ts";
import { create } from "./create.ts";
import { projectFeed } from "./feed.ts";
import { getProjectById } from "./get-project-by-id.ts";

export const projecRoutes = express.Router();

projecRoutes.get("/project/feed", projectFeed);
projecRoutes.post("/project/create", auth, create);
projecRoutes.get("/project/:projectId", getProjectById);

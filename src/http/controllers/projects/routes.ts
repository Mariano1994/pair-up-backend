import express from "express";
import { auth } from "../middlewares/auth.ts";
import { create } from "./create.ts";
import { projectFeed } from "./feed.ts";
import { getMyProjects } from "./get-my-projects.ts";
import { getProjectById } from "./get-project-by-id.ts";
import { UpdateProjectInfo } from "./update-project-info.ts";

export const projecRoutes = express.Router();

projecRoutes.get("/project/feed", projectFeed);
projecRoutes.get("/project/:projectId", getProjectById);
projecRoutes.post("/project/create", auth, create);
projecRoutes.put("/project/:projectId", auth, UpdateProjectInfo);
projecRoutes.get("/projects/my-projects", auth, getMyProjects);

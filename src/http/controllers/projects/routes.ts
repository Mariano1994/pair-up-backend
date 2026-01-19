import express from "express";
import { auth } from "../middlewares/auth.ts";
import { create } from "./create.ts";

export const projecRoutes = express.Router();

// projecRoutes.get("/project/feed");
projecRoutes.post("/project/create", auth, create);

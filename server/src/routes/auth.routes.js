import { Router } from "express";
import { login } from "../services/auth.service.js";

export const authRouter = Router();

authRouter.post("/login", async (request, response, next) => {
  try {
    const session = await login(request.body);
    response.json(session);
  } catch (error) {
    next(error);
  }
});

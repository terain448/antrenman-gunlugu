import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { authRouter } from "./routes/auth.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "couple-app-api" });
});

app.use("/api/auth", authRouter);

app.use((error, _request, response, _next) => {
  response.status(error.statusCode ?? 500).json({
    message: error.message ?? "Server error",
  });
});

app.listen(port, () => {
  console.log(`Couple API running on port ${port}`);
});

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});

app.use("/api/auth", authRoutes);

app.use(
"/api/documents",
documentRoutes
);

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    message: "API is running",
  });
});

export default app;

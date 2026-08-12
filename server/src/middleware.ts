import cors from "cors";
import express from "express";
import { CORS_ORIGINS } from "./config.js";

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (CORS_ORIGINS.length === 0) return true;
  return CORS_ORIGINS.includes(origin);
}

export const createMiddleware = () => {
  const router = express.Router();

  router.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  router.use(express.json({ limit: "2mb" }));
  router.use(express.urlencoded({ extended: true, limit: "2mb" }));

  return router;
};

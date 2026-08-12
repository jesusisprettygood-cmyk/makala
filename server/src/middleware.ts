import cors from "cors";
import express from "express";
import { CORS_ORIGINS } from "./config.js";

export const createMiddleware = () => {
  const router = express.Router();

  router.use(
    cors({
      origin: CORS_ORIGINS,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  return router;
};

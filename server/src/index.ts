import express from "express";
import { PORT } from "./config.js";
import { createMiddleware } from "./middleware.js";
import { healthRouter } from "./routes/health.js";
import { articlesRouter } from "./routes/articles.js";

const app = express();
app.use(createMiddleware());
app.use("/api/health", healthRouter);
app.use("/api/articles", articlesRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Backend started on port ${PORT}`);
});

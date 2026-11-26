import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { databaseConfigured } from "@workspace/db";
import { anthropicConfig } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/service", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: anthropicConfig() !== null,
    databaseConfigured: databaseConfigured(),
  });
});

export default router;

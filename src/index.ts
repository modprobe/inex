import express from "express";
import { metrics } from "@opentelemetry/api";
import * as extractor from "./extract";
import { logger } from "./logger";

const app = express();
const meter = metrics.getMeter("inex", process.env?.APP_VERSION);

const extractionCounter = meter.createCounter<{ success: boolean }>(
  "inex_instagram_extractions",
);

app.get(/\/(p|reel)\/(?<shortcode>[A-Za-z0-9_-]{11})/, async (req, res) => {
  const { shortcode } = req.params;

  const fail = () => {
    extractionCounter.add(1, { success: false });
    res.status(404).send("can't handle this content :(");
  };

  try {
    const videoUrl = await Promise.any([
      extractor.graphqlQuery(shortcode),
      extractor.debugOutput(shortcode),
      extractor.embed(shortcode),
    ]);

    if (!videoUrl) {
      fail();
      return;
    }

    extractionCounter.add(1, { success: true });
    res.redirect(videoUrl);
  } catch (e) {
    logger.error(`failed extraction: ${JSON.stringify(e)}`, {
      shortcode,
      error: JSON.stringify(e),
    });
    fail();
  }
});

app.get("/health", (_, res) => {
  res.send({ ok: true });
});

app.listen(
  process.env.PORT ? Number.parseInt(process.env.PORT) : 3000,
  (err) => logger.error(err?.message),
);

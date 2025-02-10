import express from "express";
import { extract } from "./extract";
import { logger } from "./logger";
import { bot } from "./bot";
import { requireEnv } from "./utils";

(async () => {
  const app = express();

  app.get(/\/(p|reel)\/(?<shortcode>[A-Za-z0-9_-]{11})/, async (req, res) => {
    const { shortcode } = req.params;

    const fail = () => {
      res.status(404).send("can't handle this content :(");
    };

    try {
      const metadata = await extract(shortcode, "web");

      if (!metadata) {
        fail();
        return;
      }

      res.redirect(metadata.videoUrl);
    } catch (e) {
      if (e instanceof AggregateError) {
        logger.error(`failed extraction: ${e.message}`, {
          shortcode,
          errors: JSON.stringify(
            e.errors.map(({ name, message }) => ({
              name,
              message,
            })),
          ),
        });
      } else if (e instanceof Error) {
        logger.error(`failed extraction: ${e.message}`, {
          shortcode,
        });
      }

      fail();
    }
  });

  app.get("/health", (_, res) => {
    res.send({ ok: true });
  });

  const APP_HOST = requireEnv("APP_HOST");
  const APP_BOT_PATH = requireEnv("APP_BOT_PATH");
  app.use(await bot.createWebhook({ domain: APP_HOST, path: APP_BOT_PATH }));

  app.listen(
    process.env.APP_PORT ? Number.parseInt(process.env.APP_PORT) : 3000,
    (err) => logger.error(err?.message),
  );
})();

import express from "express";
import * as extractor from "./extract";

const app = express();

app.get(["/p/:shortcode", "/reel/:shortcode"], async (req, res) => {
  const { shortcode } = req.params;

  const fail = () => res.status(404).send("can't handle this content :(");

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

    res.redirect(videoUrl);
  } catch (e) {
    console.log({ e });
    fail();
  }
});

app.get("/health", (_, res) => {
  res.send({ ok: true });
});

app.listen(process.env.PORT ?? 3000, console.error);

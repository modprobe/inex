import express from "express";
import { fetchVideoAlt, fetchVideo, fetchEmbed } from "./service";

const app = express();

app.get(["/p/:shortcode", "/reel/:shortcode"], async (req, res) => {
  const { shortcode } = req.params;

  const fail = () => res.status(404).send("can't handle this content :(");

  try {
    const videoUrl = await Promise.any([
      fetchVideo(shortcode),
      fetchVideoAlt(shortcode),
      fetchEmbed(shortcode),
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

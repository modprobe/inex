import express from "express";
import { fetchVideoAlt, fetchVideo, fetchEmbed } from "./service";

const app = express();

app.get("/p/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  const videoUrl =
    (await fetchEmbed(shortcode)) ??
    (await fetchVideo(shortcode)) ??
    (await fetchVideoAlt(shortcode));

  if (!videoUrl) {
    res.status(404).send("inex can only handle video content.");
    return;
  }

  res.redirect(videoUrl);
});

app.get("/health", (_, res) => {
  res.send({ ok: true });
});

app.listen(3000, console.error);

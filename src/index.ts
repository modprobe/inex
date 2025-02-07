import express from "express";
import { fetchVideoInfo } from "./service";

const app = express();

app.get("/p/:shortcode", async (req, res) => {
  const { shortcode } = req.params;

  const videoInfo = await fetchVideoInfo(shortcode);
  if (!videoInfo.video_url) {
    res.status(404);
    res.send("inex can only handle video content.");
  }

  res.redirect(videoInfo.video_url);
});

app.get("/health", (_, res) => {
  res.send({ ok: true });
});

app.listen(3000, console.error);

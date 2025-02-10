import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { requireEnv } from "./utils";
import type { InlineQueryResultVideo } from "telegraf/types";
import { extract } from "./extract";

const INSTAGRAM_URL_REGEX =
  /(https:\/\/)?(www\.)?instagram\.com\/(?<prefix>p|reel)\/(?<shortcode>[A-Za-z0-9-_]{11})\/?/g;

const APP_BOT_TOKEN = requireEnv("APP_BOT_TOKEN");
const APP_HOST = requireEnv("APP_HOST");

const extractUrlInfo = (
  messageText: string,
): { shortcode: string; prefix: string }[] => {
  const matches = [...messageText.matchAll(INSTAGRAM_URL_REGEX)];
  if (matches.length === 0) return [];

  return matches.map((m) => ({
    // biome-ignore lint/style/noNonNullAssertion: groups are always defined
    shortcode: m.groups!.shortcode,
    // biome-ignore lint/style/noNonNullAssertion: groups are always defined
    prefix: m.groups!.prefix,
  }));
};

const buildUrl = (shortcode: string, prefix = "p"): string =>
  `https://${APP_HOST}/${prefix}/${shortcode}`;

export const bot = new Telegraf(APP_BOT_TOKEN);
bot.start((ctx) =>
  ctx.reply(
    "Heyo 👋🏻 Send me a message containing an Instagram link, and I'll reply with a link that'll get you the video directly",
  ),
);

bot.help((ctx) =>
  ctx.reply(
    "Send me a message containing an Instagram link, and I'll reply with a link that'll get you the video directly",
  ),
);

bot.on(message("text"), async (ctx) => {
  const infos = extractUrlInfo(ctx.message.text);
  if (infos.length === 0 && ctx.chat.type === "private") {
    return await ctx.reply(
      "Couldn't detect an Instagram link in your message :(",
    );
  }

  for (const info of infos) {
    const videoMetadata = await extract(info.shortcode, "bot");
    if (!videoMetadata) {
      continue;
    }

    await ctx.sendVideo(videoMetadata.videoUrl, {
      caption: `📹 Video by @${videoMetadata.username}\n${videoMetadata.caption ? `📝 ${videoMetadata.caption}\n` : ""}🔗 ${buildUrl(info.shortcode, info.prefix)}`,
    });
  }
});

bot.on("inline_query", async (ctx) => {
  const urlInfos = extractUrlInfo(ctx.inlineQuery.query);
  if (urlInfos.length === 0) {
    return await ctx.answerInlineQuery([]);
  }

  const queryResults: InlineQueryResultVideo[] = [];

  for (const urlInfo of urlInfos) {
    try {
      const metadata = await extract(urlInfo.shortcode, "bot");
      if (!metadata) {
        continue;
      }

      queryResults.push({
        type: "video",
        id: urlInfo.shortcode,
        video_url: metadata.videoUrl,
        mime_type: "video/mp4",
        thumbnail_url: metadata.thumbnailUrl,
        title: metadata.caption ?? `Video by @${metadata.username}`,
        input_message_content: {
          message_text: buildUrl(urlInfo.shortcode, urlInfo.prefix),
        },
      });
    } catch {}
  }

  await ctx.answerInlineQuery(queryResults);
});

import type { Extractor } from ".";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "en-GB,en;q=0.9",
  "cache-control": "max-age=0",
  dpr: "2",
  priority: "u=0, i",
  "sec-ch-prefers-color-scheme": "light",
  "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
  "sec-ch-ua-full-version-list":
    '"Not A(Brand";v="8.0.0.0", "Chromium";v="132.0.6834.160"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-model": '""',
  "sec-ch-ua-platform": '"macOS"',
  "sec-ch-ua-platform-version": '"15.2.0"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "viewport-width": "1501",
};

const parameterRegex = (parameter: string): RegExp =>
  new RegExp(`\\\\"${parameter}\\\\":\\\\"(?<value>[^"]+)\\\\"`);

const detectEscapeLevel = (input: string): number => {
  const matches = [...input.matchAll(/\\+/g)];
  const lengths = matches.map((m) => m[0].length);

  return Math.max(...lengths);
};

const jsonUnescape = (input: string, level?: number): string => {
  if (!level) {
    level = detectEscapeLevel(input);
  }

  return level > 0
    ? [...new Array(level)].reduce((acc) => JSON.parse(`"${acc}"`), input)
    : input;
};

const extractParameter = (
  embed: string,
  parameter: string,
): string | undefined => {
  const regex = parameterRegex(parameter);
  const extractedValue = embed.match(regex)?.groups?.value;

  if (!extractedValue) return undefined;

  return jsonUnescape(extractedValue);
};

const extractRequiredParameter = (embed: string, parameter: string): string => {
  const value = extractParameter(embed, parameter);
  if (!value) {
    throw new Error(`couldn't extract ${parameter}. response: ${embed}`);
  }

  return value;
};

const extract: Extractor = async (shortcode) => {
  const url = `https://www.instagram.com/p/${shortcode}/embed/`;

  const response = await fetch(url, {
    headers: HEADERS,
  });

  const body = await response.text();

  if (body.includes("EmbedIsBroken")) {
    throw new Error("Embed is unavailable for this video");
  }

  return {
    videoUrl: extractRequiredParameter(body, "video_url"),
    username: extractRequiredParameter(body, "username"),
    caption: extractParameter(body, "caption"),
    thumbnailUrl: extractRequiredParameter(body, "thumbnail_src"),
  };
};

export default extract;

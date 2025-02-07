const API_HEADERS = {
  "X-IG-App-ID": "936619743392459",
  "X-ASBD-ID": "198387",
  "X-IG-WWW-Claim": "0",
  Origin: "https://www.instagram.com",
  Accept: "*/*",
  "X-CSRFToken": "",
  "X-Requested-With": "XMLHttpRequest",
};

type MediaData = {
  shortcode: string;
  video_url: string;
};

type DataResponse = {
  data: {
    xdt_shortcode_media?: MediaData;
  };
};

type AlternateResponse = {
  graphql: {
    shortcode_media?: MediaData;
  };
};

export const fetchVideo = async (
  shortcode: string,
): Promise<string | undefined> => {
  const variables = {
    shortcode: shortcode,
    child_comment_count: "3",
    fetch_comment_count: "40",
    parent_comment_count: "24",
    has_threaded_comments: "True",
  };

  const queryString = new URLSearchParams({
    doc_id: "8845758582119845",
    variables: JSON.stringify(variables),
  });

  const url = `https://www.instagram.com/graphql/query/?${queryString.toString()}`;
  const response = await fetch(url, {
    headers: {
      ...API_HEADERS,
      Referrer: `https://instagram.com/p/${shortcode}`,
    },
  });

  const responseData = <DataResponse>await response.json();

  if (!responseData.data || !responseData.data.xdt_shortcode_media) {
    throw new Error(
      `couldn't fetch video url. response: ${JSON.stringify(responseData)}`,
    );
  }

  return responseData.data?.xdt_shortcode_media?.video_url;
};

export const fetchVideoAlt = async (
  shortcode: string,
): Promise<string | undefined> => {
  const url = `https://www.instagram.com/p/${shortcode}?__a=1&__d=dis`;
  const response = await fetch(url, {
    headers: {
      ...API_HEADERS,
      Referrer: `https://www.instagram.com/p/${shortcode}`,
    },
  });

  const responseBody = await response.text();

  try {
    const responseData = <AlternateResponse>JSON.parse(responseBody);

    if (!responseData.graphql || !responseData.graphql.shortcode_media) {
      throw new Error(
        `couldn't fetch video url. response: ${JSON.stringify(responseData)}`,
      );
    }

    return responseData.graphql?.shortcode_media?.video_url;
  } catch {
    throw new Error(`couldn't decode response body. body: ${responseBody}`);
  }
};

export const fetchEmbed = async (
  shortcode: string,
): Promise<string | undefined> => {
  const url = `https://www.instagram.com/p/${shortcode}/embed/`;

  const response = await fetch(url, {
    headers: {
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
    },
  });

  const body = await response.text();

  const VIDEO_URL_REGEX = /\\"video_url\\":\\"(?<url>[^"]+)\\"/;
  const videoUrl = body.match(VIDEO_URL_REGEX)?.groups?.url;

  if (!videoUrl) {
    throw new Error(`couldn't fetch video URL. response: ${body}`);
  }

  return videoUrl.replaceAll("\\u0025", "%").replaceAll("\\", "");
};

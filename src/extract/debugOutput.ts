import type { Extractor } from ".";

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

type AlternateResponse = {
  graphql: {
    shortcode_media?: MediaData;
  };
};

const extract: Extractor = async (shortcode) => {
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

export default extract;

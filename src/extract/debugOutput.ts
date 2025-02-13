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

type AlternateResponse = {
  graphql: {
    shortcode_media?: {
      shortcode: string;
      owner: {
        full_name?: string;
        username: string;
      };
      edge_media_to_caption: {
        edges: {
          node: {
            text?: string;
          };
        }[];
      };
      video_url: string;
      thumbnail_src: string;
    };
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

    return {
      source: "debugOutput",
      videoUrl: responseData.graphql.shortcode_media.video_url,
      thumbnailUrl: responseData.graphql.shortcode_media.thumbnail_src,
      username: responseData.graphql.shortcode_media.owner.username,
      caption:
        responseData.graphql.shortcode_media.edge_media_to_caption.edges[0]
          ?.node.text,
    };
  } catch {
    throw new Error(`couldn't decode response body. body: ${responseBody}`);
  }
};

export default extract;

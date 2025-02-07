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
  console.log("response: ", { responseData });

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

  try {
    const responseData = <AlternateResponse>await response.json();
    console.log("response: ", { responseData });

    return responseData.graphql?.shortcode_media?.video_url;
  } catch {
    console.log(await response.text());
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
    },
  });

  const body = await response.text();

  const VIDEO_URL_REGEX = /\\"video_url\\":\\"(?<url>.+)\\"/;
  const video_url = body.match(VIDEO_URL_REGEX)?.groups?.url;

  return video_url?.replaceAll("\\", "");
};

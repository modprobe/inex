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
  id: string;
  shortcode: string;
  thumbnail_src: string;
  display_url: string;
  video_url: string;
};

type DataResponse = {
  data: {
    xdt_shortcode_media?: MediaData;
  };
};

export const fetchVideoInfo = async (
  shortcode: string,
): Promise<MediaData | undefined> => {
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

  const responseData: DataResponse = await response.json();
  console.log("response: ", { responseData });

  return responseData.data?.xdt_shortcode_media;
};

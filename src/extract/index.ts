import { metrics } from "@opentelemetry/api";
import debugOutput from "./debugOutput";
import embed from "./embed";
import graphqlQuery from "./graphqlQuery";
import { logger } from "../logger";

export type VideoMetadata = {
  source: "graphqlQuery" | "debugOutput" | "embed";

  videoUrl: string;
  username: string;
  thumbnailUrl: string;
  caption?: string;
};

export type Extractor = (shortcode: string) => Promise<VideoMetadata>;

export { default as graphqlQuery } from "./graphqlQuery";
export { default as debugOutput } from "./debugOutput";
export { default as embed } from "./embed";

const meter = metrics.getMeter("inex", process.env?.APP_VERSION);

const extractionCounter = meter.createCounter<{
  success: boolean;
  source?: string;
}>("inex_instagram_extractions");

export const extract = async (
  shortcode: string,
  source?: "web" | "bot",
): Promise<VideoMetadata | undefined> => {
  try {
    const metadata = await Promise.any([
      graphqlQuery(shortcode),
      debugOutput(shortcode),
      embed(shortcode),
    ]);

    extractionCounter.add(1, { success: true, source });
    return metadata;
  } catch (e) {
    extractionCounter.add(1, { success: false, source });

    if (e instanceof AggregateError) {
      logger.error(`failed extraction: ${e.message}`, {
        shortcode,
        errors: JSON.stringify(
          e.errors.map(({ name, message }) => ({
            name,
            message,
          })),
        ),
      });
    } else if (e instanceof Error) {
      logger.error(`failed extraction: ${e.message}`, {
        shortcode,
      });
    }
  }
};

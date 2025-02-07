export type Extractor = (shortcode: string) => Promise<string>;

export { default as graphqlQuery } from "./graphqlQuery";
export { default as debugOutput } from "./debugOutput";
export { default as embed } from "./embed";

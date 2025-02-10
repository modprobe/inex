export const requireEnv = (envVar: string): string => {
  const value = process.env[envVar];

  if (!value) {
    throw new Error(`Environment variable ${envVar} must be set`);
  }

  return value;
};

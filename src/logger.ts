import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport";
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.OTEL_LOG_LEVEL ?? "info",
  transports: [new OpenTelemetryTransportV3()],
});

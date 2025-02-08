import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

const sdk = new NodeSDK({
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-winston": { disableLogSending: true }, // we rather explicitly define the right winston transport
    }),
  ],
  resource: Resource.default().merge(
    new Resource({
      [ATTR_SERVICE_NAME]: "inex",
      [ATTR_SERVICE_VERSION]: process.env.APP_VERSION ?? undefined,
    }),
  ),
});

sdk.start();

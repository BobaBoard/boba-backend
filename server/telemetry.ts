import { HoneycombSDK } from "@honeycombio/opentelemetry-node";
// Example filename: tracing.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

if (process.env.NODE_ENV == "production") {
  const sdk: NodeSDK = new HoneycombSDK({
    apiKey: process.env.HONEYCOMB_API_KEY,
    dataset: "bobaserver",
    serviceName: "bobaboard-backend-service",
    instrumentations: [
      getNodeAutoInstrumentations({
        // We recommend disabling fs automatic instrumentation because
        // it can be noisy and expensive during startup
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
      }),
    ],
  });

  sdk.start();
}

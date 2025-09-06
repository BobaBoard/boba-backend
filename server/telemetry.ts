import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

// This is the default port for OTLP gRPC. Change if you use a different one.
const collectorUrl = "https://api.honeycomb.io";

const serviceName = "bobaboard-backend-service";
const datasetName = "bobaserver";
const honeycombApiKey = process.env.HONEYCOMB_API_KEY;

if (honeycombApiKey && process.env.NODE_ENV == "production") {
  // Use a collector-compatible exporter for OTLP
  const exporter = new OTLPTraceExporter({
    url: `${collectorUrl}/v1/traces`,
    headers: {
      "x-honeycomb-team": honeycombApiKey,
      "x-honeycomb-dataset": datasetName,
      "x-honeycomb-service-name": serviceName,
    },
  });

  const sdk: NodeSDK = new NodeSDK({
    traceExporter: exporter,
    serviceName: serviceName,
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
  // Initialize the SDK
  sdk.start();

  // Graceful shutdown
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("Tracing terminated"))
      .catch((error) => console.log("Error terminating tracing", error))
      .finally(() => process.exit(0));
  });
}

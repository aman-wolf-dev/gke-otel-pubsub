const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { W3CTraceContextPropagator } = require('@opentelemetry/propagator-w3c');

const exporter = new OTLPTraceExporter();
const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
  textMapPropagator: new W3CTraceContextPropagator()
});

sdk.start();
process.on('SIGTERM', () => sdk.shutdown().then(() => process.exit(0)));
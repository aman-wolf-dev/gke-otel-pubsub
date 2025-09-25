const { NodeSDK } = require('@opentelemetry/sdk-node');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { W3CTraceContextPropagator } = require('@opentelemetry/propagator-w3c');
const api = require('@opentelemetry/api');

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
  instrumentations: [new HttpInstrumentation()],
});

sdk.start().then(() => {
  // set W3C propagator globally
  api.propagation.setGlobalPropagator(new W3CTraceContextPropagator());
  console.log('OpenTelemetry started for backend-a');
});
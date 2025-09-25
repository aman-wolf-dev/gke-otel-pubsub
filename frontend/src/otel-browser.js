import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { W3CTraceContextPropagator } from '@opentelemetry/propagator-w3c';
import * as api from '@opentelemetry/api';

export function initOtel() {
  const provider = new WebTracerProvider();
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  provider.register({
    propagator: new W3CTraceContextPropagator(),
  });

  api.propagation.setGlobalPropagator(new W3CTraceContextPropagator());

  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: /.*/,
      }),
    ],
  });

  return api.trace.getTracer('frontend-tracer');
}
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// OpenTelemetry (web)
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { W3CTraceContextPropagator } from '@opentelemetry/propagator-w3c';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

const provider = new WebTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register({ propagator: new W3CTraceContextPropagator() });

createRoot(document.getElementById('root')).render(<App />);
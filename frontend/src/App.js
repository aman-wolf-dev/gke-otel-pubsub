import React from 'react';
import { trace, context } from '@opentelemetry/api';

export default function App() {
  const handleClick = async () => {
    // Start a client span around the fetch (optional)
    const tracer = trace.getTracer('frontend-tracer');
    await context.with(trace.setSpan(context.active(), tracer.startSpan('frontend-click')), async () => {
      try {
        const resp = await fetch('/api/publish', { method: 'POST', body: JSON.stringify({ text: 'hello from frontend' }), headers: { 'Content-Type': 'application/json' } });
        const json = await resp.json();
        console.log(json);
      } catch (e) {
        console.error(e);
      } finally {
        trace.getTracer('frontend-tracer').getActiveSpan()?.end?.();
      }
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Microservices Pub/Sub Tracing Demo</h1>
      <button onClick={handleClick}>Send message</button>
    </div>
  );
}
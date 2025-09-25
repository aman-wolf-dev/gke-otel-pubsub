import React, { useEffect } from 'react';
import axios from 'axios';
import { initOtel } from './otel-browser';
import * as api from '@opentelemetry/api';

function App() {
  const tracer = initOtel();

  const handleClick = async () => {
    // create client-side span
    const span = tracer.startSpan('frontend.click-publish');
    await api.context.with(api.trace.setSpan(api.context.active(), span), async () => {
      try {
        // axios will use fetch instrumentation (if configured) or you can inject headers manually
        await axios.post('http://localhost:3001/publish', { message: 'from frontend' });
        console.log('published');
      } catch (err) {
        console.error(err);
      } finally {
        span.end();
      }
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Pub/Sub trace propagation demo</h2>
      <button onClick={handleClick}>Send message</button>
      <p>Open console for trace output from frontend and backend services (they print spans to console).</p>
    </div>
  );
}

export default App;
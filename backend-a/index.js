// backend-a/index.js
require('./otel-node'); // start tracing
const express = require('express');
const bodyParser = require('body-parser');
const { PubSub } = require('@google-cloud/pubsub');
const api = require('@opentelemetry/api');

const PUBSUB_ENDPOINT = process.env.PUBSUB_EMULATOR_HOST || 'localhost:8085';
const PUBSUB_PROJECT = 'demo-project';
const TOPIC = 'trace-topic';

const pubsub = new PubSub({
  apiEndpoint: PUBSUB_ENDPOINT,
  projectId: PUBSUB_PROJECT,
});

const app = express();
app.use(bodyParser.json());

app.post('/publish', async (req, res) => {
  // Create a span for the operation (HTTP instrumentation usually creates one automatically too)
  const tracer = api.trace.getTracer('backend-a-tracer');
  const span = tracer.startSpan('backend-a.publish-handler');

  // create a context with the span
  const ctx = api.trace.setSpan(api.context.active(), span);
  try {
    await api.context.with(ctx, async () => {
      const messageBody = req.body.message || 'hello from frontend';
      // inject current trace context into attributes
      const carrier = {};
      api.propagation.inject(api.context.active(), carrier);

      // convert carrier headers into Pub/Sub message attributes
      const attributes = carrier; // carrier is a plain object with traceparent, etc.

      const dataBuffer = Buffer.from(JSON.stringify({ text: messageBody }));
      const messageId = await pubsub.topic(TOPIC).publish(dataBuffer, attributes);
      console.log('Published message ${messageId} with attributes, attributes');

      res.json({ ok: true, messageId });
    });
  } catch (err) {
    span.recordException(err);
    res.status(500).json({ error: String(err) });
  } finally {
    span.end();
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('backend-a listening on ${port}'));
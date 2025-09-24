const express = require('express');
const bodyParser = require('body-parser');
const { PubSub } = require('@google-cloud/pubsub');
const { trace, context, propagation } = require('@opentelemetry/api');

const app = express();
app.use(bodyParser.json());

const pubsub = new PubSub();
const TOPIC_NAME = process.env.TOPIC_NAME || 'demo-topic';

app.post('/api/publish', async (req, res) => {
  const tracer = trace.getTracer('backend-a');

  // Start a server span (auto-instrumentation also does this).
  const span = tracer.startSpan('handle-publish');
  await context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const data = Buffer.from(JSON.stringify({ text: req.body.text || 'hello' }));

      // Inject the current trace context into attributes
      const attributes = {};
      propagation.inject(context.active(), attributes, {
        set: (carrier, key, value) => { carrier[key] = value; }
      });

      // Important: Pub/Sub attributes must be strings
      Object.keys(attributes).forEach(k => { attributes[k] = String(attributes[k] || ''); });

      const messageId = await pubsub.topic(TOPIC_NAME).publishMessage({ data, attributes });
      span.addEvent('published-to-pubsub', { messageId });
      res.json({ ok: true, messageId });
    } catch (err) {
      span.recordException(err);
      res.status(500).json({ ok: false, error: err.message });
    } finally {
      span.end();
    }
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`backend-a listening on ${port}`));
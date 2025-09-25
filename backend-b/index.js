// backend-b/index.js
require('./otel-node');
const { PubSub } = require('@google-cloud/pubsub');
const api = require('@opentelemetry/api');

const PUBSUB_ENDPOINT = process.env.PUBSUB_EMULATOR_HOST || 'localhost:8085';
const PUBSUB_PROJECT = 'demo-project';
const SUBSCRIPTION = 'trace-sub';

const pubsub = new PubSub({
  apiEndpoint: PUBSUB_ENDPOINT,
  projectId: PUBSUB_PROJECT,
});

async function start() {
  const subscription = pubsub.subscription(SUBSCRIPTION);

  subscription.on('message', message => {
    try {
      // Extract trace context from message.attributes
      const attributes = message.attributes || {};
      // reconstruct carrier object
      const carrier = attributes;

      const propagator = api.propagation;
      const extractedCtx = propagator.extract(api.context.active(), carrier);

      // start a span within the extracted context so the trace continues
      const tracer = api.trace.getTracer('backend-b-tracer');
      api.context.with(extractedCtx, () => {
        const span = tracer.startSpan('backend-b.process-message');
        api.context.with(api.trace.setSpan(api.context.active(), span), () => {
          console.log('Processing message:', message.id, message.data.toString());
          // simulate work
          setTimeout(() => {
            span.end();
            message.ack();
          }, 100);
        });
      });
    } catch (err) {
      console.error('Error processing message', err);
      message.nack();
    }
  });

  subscription.on('error', err => {
    console.error('Subscription error', err);
  });

  console.log('backend-b listening to messages on', SUBSCRIPTION);
}

start().catch(err => {
  console.error(err);
  process.exit(1);
});
const { PubSub } = require('@google-cloud/pubsub');
const { trace, context, propagation } = require('@opentelemetry/api');

const pubsub = new PubSub();
const SUB_NAME = process.env.SUBSCRIPTION_NAME || 'demo-sub';

async function start() {
  const subscription = pubsub.subscription(SUB_NAME);

  subscription.on('message', message => {
    // Extract trace context from message attributes
    const attributes = message.attributes || {};

    const carrier = { ...attributes };

    const ctx = propagation.extract(context.active(), carrier, {
      get: (c, key) => c[key],
      keys: c => Object.keys(c)
    });

    const tracer = trace.getTracer('backend-b');

    context.with(ctx, () => {
      const span = tracer.startSpan('process-pubsub-message');
      try {
        span.addEvent('received-pubsub-message', { messageId: message.id });
        const data = JSON.parse(message.data.toString());
        console.log('processing message:', data);
        // simulate work
      } catch (err) {
        span.recordException(err);
      } finally {
        span.end();
        message.ack();
      }
    });
  });

  subscription.on('error', err => console.error('Subscription error:', err));
}

start().catch(console.error);
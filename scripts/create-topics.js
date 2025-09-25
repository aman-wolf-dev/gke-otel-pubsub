const { PubSub } = require('@google-cloud/pubsub');

async function main() {
  const endpoint = process.env.PUBSUB_EMULATOR_HOST || 'localhost:8085';
  const pubsub = new PubSub({
    apiEndpoint: endpoint,
    projectId: 'demo-project',
  });

  const topicName = 'trace-topic';
  const subscriptionName = 'trace-sub';

  const [topics] = await pubsub.getTopics();
  if (!(await pubsub.topic(topicName).exists())[0]) {
    await pubsub.createTopic(topicName);
    console.log('Created topic', topicName);
  } else {
    console.log('Topic exists:', topicName);
  }

  const topic = pubsub.topic(topicName);
  if (!(await topic.subscription(subscriptionName).exists())[0]) {
    await topic.createSubscription(subscriptionName);
    console.log('Created subscription', subscriptionName);
  } else {
    console.log('Subscription exists:', subscriptionName);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const userModel = require("../models/userModel")
async function handleWebhookStripe(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        await userModel.updateSubscriptionStatus(userId, 'Pro');
        console.log(`Subscription activated for user ${userId}`);
        break;
      }

      case 'invoice.paid': {
        const customerId = event.data.object.customer;
        const user = await userModel.findByStripeCustomerId(customerId);
        if (user) {
          await userModel.updateSubscriptionStatus(user.id, 'Pro');
          console.log(`Invoice paid; subscription status updated for user ${user.id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const customerId = event.data.object.customer;
        const user = await userModel.findByStripeCustomerId(customerId);
        if (user) {
          await userModel.updateSubscriptionStatus(user.id, 'Canceled');
          console.log(`Payment failed; subscription canceled for user ${user.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).send('Internal Server Error');
  }

  res.status(200).send('Webhook received successfully');
}

module.exports = handleWebhookStripe
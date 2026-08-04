const express = require("express");
const Stripe = require("stripe");
const pool = require("../config/db");
const { createSubscription, updateSubscriptionByStripeId } = require("../models/Subscription");
const { createInvoice } = require("../models/Invoice");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// @route   POST /api/webhooks/stripe
// @desc    Handle Stripe webhook events (checkout completed, invoice paid, subscription updated)
// NOTE: This route must receive the RAW request body (configured in server.js) for signature verification.
router.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = parseInt(session.metadata.userId, 10);
        const planId = parseInt(session.metadata.planId, 10);

        await createSubscription({
          userId,
          planId,
          stripeSubscriptionId: session.subscription,
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // approx 30 days
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const subResult = await pool.query(
          "SELECT * FROM subscriptions WHERE stripe_subscription_id = $1",
          [invoice.subscription]
        );
        const subscription = subResult.rows[0];

        if (subscription) {
          await createInvoice({
            userId: subscription.user_id,
            subscriptionId: subscription.id,
            stripeInvoiceId: invoice.id,
            amountPaid: invoice.amount_paid / 100,
            status: invoice.status,
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscriptionObj = event.data.object;
        await updateSubscriptionByStripeId(subscriptionObj.id, {
          status: subscriptionObj.status,
          currentPeriodEnd: new Date(subscriptionObj.current_period_end * 1000),
        });
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

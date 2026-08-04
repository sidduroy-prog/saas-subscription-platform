const express = require("express");
const Stripe = require("stripe");
const { protect } = require("../middleware/auth");
const { getPlanById } = require("../models/Plan");
const { getSubscriptionByUserId, getAllSubscriptionsWithUsers } = require("../models/Subscription");
const { updateStripeCustomerId, findUserById } = require("../models/User");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// @route   POST /api/subscriptions/create-checkout-session
// @desc    Create a Stripe Checkout session for a chosen plan
router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = await getPlanById(planId);

    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Free plan doesn't need Stripe checkout
    if (Number(plan.price_monthly) === 0) {
      return res.status(400).json({ message: "Free plan does not require checkout" });
    }

    const user = await findUserById(req.user.id);
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;
      await updateStripeCustomerId(user.id, customerId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${plan.name} Plan` },
            unit_amount: Math.round(Number(plan.price_monthly) * 100),
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: String(user.id), planId: String(plan.id) },
      success_url: `${process.env.FRONTEND_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?checkout=cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/subscriptions/me
// @desc    Get logged-in user's current subscription
router.get("/me", protect, async (req, res) => {
  try {
    const subscription = await getSubscriptionByUserId(req.user.id);
    res.json(subscription || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/subscriptions/all
// @desc    Admin: view all subscriptions
router.get("/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const subscriptions = await getAllSubscriptionsWithUsers();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

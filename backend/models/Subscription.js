const pool = require("../config/db");

const createSubscription = async ({ userId, planId, stripeSubscriptionId, status, currentPeriodEnd }) => {
  const result = await pool.query(
    `INSERT INTO subscriptions (user_id, plan_id, stripe_subscription_id, status, current_period_end)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, planId, stripeSubscriptionId, status, currentPeriodEnd]
  );
  return result.rows[0];
};

const getSubscriptionByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT s.*, p.name AS plan_name, p.price_monthly, p.features
     FROM subscriptions s
     JOIN plans p ON s.plan_id = p.id
     WHERE s.user_id = $1
     ORDER BY s.created_at DESC
     LIMIT 1`,
    [userId]
  );
  return result.rows[0];
};

const updateSubscriptionByStripeId = async (stripeSubscriptionId, { status, currentPeriodEnd }) => {
  const result = await pool.query(
    `UPDATE subscriptions
     SET status = $1, current_period_end = $2, updated_at = NOW()
     WHERE stripe_subscription_id = $3
     RETURNING *`,
    [status, currentPeriodEnd, stripeSubscriptionId]
  );
  return result.rows[0];
};

const getAllSubscriptionsWithUsers = async () => {
  const result = await pool.query(
    `SELECT s.id, s.status, s.current_period_end, u.name AS user_name, u.email, p.name AS plan_name, p.price_monthly
     FROM subscriptions s
     JOIN users u ON s.user_id = u.id
     JOIN plans p ON s.plan_id = p.id
     ORDER BY s.created_at DESC`
  );
  return result.rows;
};

module.exports = {
  createSubscription,
  getSubscriptionByUserId,
  updateSubscriptionByStripeId,
  getAllSubscriptionsWithUsers,
};

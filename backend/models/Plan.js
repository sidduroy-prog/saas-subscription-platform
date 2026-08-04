const pool = require("../config/db");

const getAllPlans = async () => {
  const result = await pool.query("SELECT * FROM plans ORDER BY price_monthly ASC");
  return result.rows;
};

const getPlanById = async (id) => {
  const result = await pool.query("SELECT * FROM plans WHERE id = $1", [id]);
  return result.rows[0];
};

const updatePlanStripePriceId = async (planId, stripePriceId) => {
  await pool.query("UPDATE plans SET stripe_price_id = $1 WHERE id = $2", [
    stripePriceId,
    planId,
  ]);
};

module.exports = { getAllPlans, getPlanById, updatePlanStripePriceId };

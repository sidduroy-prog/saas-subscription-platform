const pool = require("../config/db");

const createInvoice = async ({ userId, subscriptionId, stripeInvoiceId, amountPaid, status }) => {
  const result = await pool.query(
    `INSERT INTO invoices (user_id, subscription_id, stripe_invoice_id, amount_paid, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, subscriptionId, stripeInvoiceId, amountPaid, status]
  );
  return result.rows[0];
};

const getInvoicesByUserId = async (userId) => {
  const result = await pool.query(
    "SELECT * FROM invoices WHERE user_id = $1 ORDER BY invoice_date DESC",
    [userId]
  );
  return result.rows;
};

module.exports = { createInvoice, getInvoicesByUserId };

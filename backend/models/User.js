const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const createUser = async ({ name, email, password, role = "user" }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email, role, stripe_customer_id, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

const updateStripeCustomerId = async (userId, stripeCustomerId) => {
  await pool.query("UPDATE users SET stripe_customer_id = $1 WHERE id = $2", [
    stripeCustomerId,
    userId,
  ]);
};

const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
  );
  return result.rows;
};

const matchPassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateStripeCustomerId,
  getAllUsers,
  matchPassword,
};

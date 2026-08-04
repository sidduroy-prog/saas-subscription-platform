const express = require("express");
const pool = require("../config/db");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Admin analytics: total users, active subscriptions, revenue breakdown by plan
router.get("/stats", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const totalUsers = await pool.query("SELECT COUNT(*) FROM users");
    const activeSubscriptions = await pool.query(
      "SELECT COUNT(*) FROM subscriptions WHERE status = 'active'"
    );
    const revenueByPlan = await pool.query(
      `SELECT p.name, COUNT(s.id) AS subscriber_count, SUM(p.price_monthly) AS monthly_revenue
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.status = 'active'
       GROUP BY p.name`
    );

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count, 10),
      activeSubscriptions: parseInt(activeSubscriptions.rows[0].count, 10),
      revenueByPlan: revenueByPlan.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

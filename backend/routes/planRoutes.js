const express = require("express");
const { getAllPlans } = require("../models/Plan");

const router = express.Router();

// @route   GET /api/plans
// @desc    Get all available subscription plans (public)
router.get("/", async (req, res) => {
  try {
    const plans = await getAllPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

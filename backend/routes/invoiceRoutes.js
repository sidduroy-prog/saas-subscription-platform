const express = require("express");
const { getInvoicesByUserId } = require("../models/Invoice");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/invoices
// @desc    Get logged-in user's invoice/billing history
router.get("/", protect, async (req, res) => {
  try {
    const invoices = await getInvoicesByUserId(req.user.id);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

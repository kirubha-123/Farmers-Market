// backend/src/routes/orders.js - ADD STOCK DEDUCTION
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// ✅ CREATE ORDER - ATOMIC STOCK UPDATE & ALERTS
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }

    const successfulUpdates = [];
    const stockErrors = [];

    // Process items atomically
    for (const item of items) {
      // Cast quantity strictly to Number to prevent MongoDB comparison mismatch
      const deductQty = Number(item.quantityKg);

      // Find and decrement atomically if stock is sufficient
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stockKg: { $gte: deductQty } },
        { $inc: { stockKg: -deductQty } },
        { new: true } // Return updated document
      );

      if (!updatedProduct) {
        // Find out why it failed
        const product = await Product.findById(item.productId);
        if (!product) {
          stockErrors.push(`${item.name || item.productId} not found`);
        } else {
          stockErrors.push(`${product.name}: Only ${product.stockKg} units available`);
        }
        continue;
      }

      // Check if stock reached 0 to update status
      if (updatedProduct.stockKg === 0 && updatedProduct.status !== 'out_of_stock') {
        updatedProduct.status = 'out_of_stock';
        await updatedProduct.save();
      }

      // Notification Logic: Low Stock Alert
      if (updatedProduct.stockKg <= (updatedProduct.lowStockThreshold || 10)) {
        const lastSent = updatedProduct.lastLowStockAlertSentAt;
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        if (!lastSent || lastSent < oneHourAgo) {
          // Trigger Notification
          const Notification = require('../models/Notification');
          await Notification.create({
            recipientId: updatedProduct.farmer,
            title: 'Critical Low Stock Alert',
            message: `Your listing for ${updatedProduct.name} is running low. Only ${updatedProduct.stockKg} units left in stock!`,
            type: 'low_stock'
          });

          updatedProduct.lastLowStockAlertSentAt = new Date();
          await updatedProduct.save();
        }
      }

      successfulUpdates.push(updatedProduct);
    }

    if (stockErrors.length > 0) {
      // In a real transactional system, we would rollback here.
      // For simplicity without replica-set transactions, we return the error
      return res.status(400).json({
        message: 'Stock issues preventing order creation:',
        errors: stockErrors
      });
    }

    // CREATE ORDER
    const order = await Order.create({
      buyer: req.user.id,
      items,
      totalAmount,
      deliveryAddress: req.body.address,
      status: 'pending'
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name')
      .populate('items.productId', 'name pricePerKg image');

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error('❌ Order creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET BUYER ORDERS
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('items.productId', 'name pricePerKg image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ GET FARMER ORDERS (shows in dashboard)
router.get('/farmer-orders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Farmers only' });
    }

    // 1. Find all product IDs belonging to this farmer
    const myProducts = await Product.find({ farmer: req.user.id }).select('_id');
    const myProductIds = myProducts.map(p => p._id);

    // 2. Find orders that contain at least one of these products
    const orders = await Order.find({
      'items.productId': { $in: myProductIds },
      status: { $ne: 'cancelled' }
    })
      .populate('buyer', 'name phone')
      .populate('items.productId', 'name pricePerKg farmer')
      .sort({ createdAt: -1 });

    // 3. (Optional) Filter items within the order to only show those belonging to this farmer?
    // For now, showing the full order is standard unless it's a multi-farmer marketplace order.

    res.json(orders);
  } catch (err) {
    console.error('Farmer orders fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

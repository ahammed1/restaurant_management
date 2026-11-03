const db = require('../config/db');
const notif = require('../services/notificationService');

exports.getOrders = (req, res) => {
  res.json({ success: true, orders: db.getOrders() });
};

exports.getMyOrders = (req, res) => {
  res.json({ success: true, orders: db.getOrdersForCustomer(req.user.id) });
};

exports.createOrder = async (req, res) => {
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Add at least one item to your order.' });
  }

  const menu = db.getMenuItems();
  const items = [];
  for (const requestedItem of req.body.items) {
    if (!requestedItem || typeof requestedItem.id !== 'string') {
      return res.status(400).json({ success: false, message: 'Your order contains an invalid or unavailable item.' });
    }
    const menuItem = menu.find(item => item.id === requestedItem.id && item.isAvailable);
    if (!menuItem || !Number.isInteger(requestedItem.quantity) || requestedItem.quantity < 1) {
      return res.status(400).json({ success: false, message: 'Your order contains an invalid or unavailable item.' });
    }
    items.push({
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: requestedItem.quantity
    });
  }

  if (!['DINE_IN', 'TAKEAWAY'].includes(req.body.orderType || 'DINE_IN')) {
    return res.status(400).json({ success: false, message: 'Choose a valid order type.' });
  }

  const order = db.createOrder({
    customerId: req.user.id,
    orderType: req.body.orderType || 'DINE_IN',
    tableNumber: req.body.tableNumber || null,
    customerName: req.user.name,
    customerPhone: req.user.phone,
    items
  });
  await notif.sendOrderConfirmation(order);

  const io = req.app.get('io');
  if (io) io.to('staff_stream').emit('new_order_placed', order);

  res.status(201).json({ success: true, order });
};

exports.updateStatus = async (req, res) => {
  if (!['RECEIVED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status.' });
  }
  const order = db.updateOrderStatus(req.params.id, req.body.status);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  await notif.sendOrderStatusUpdate(order);

  const io = req.app.get('io');
  if (io) {
    io.to('staff_stream').emit('order_status_updated', order);
    if (order.customerId) io.to(`customer_${order.customerId}`).emit('order_status_changed', order);
  }

  res.json({ success: true, order });
};
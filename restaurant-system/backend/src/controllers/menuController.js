const db = require('../config/db');

exports.getMenu = (req, res) => {
  res.json({ success: true, items: db.getMenuItems() });
};

exports.addDish = (req, res) => {
  const newDish = {
    id: `menu-${Date.now().toString().slice(-4)}`,
    categoryId: req.body.categoryId || 'cat-mains',
    name: req.body.name,
    description: req.body.description || '',
    price: parseFloat(req.body.price) || 15.00,
    prepTime: req.body.prepTime || '15m',
    isAvailable: true,
    badge: 'New'
  };

  db.addMenuItem(newDish);
  const io = req.app.get('io');
  if (io) io.emit('menu_item_updated', newDish);

  res.status(201).json({ success: true, item: newDish });
};

exports.toggleAvailability = (req, res) => {
  const item = db.toggleItemAvailability(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Item not found" });

  const io = req.app.get('io');
  if (io) io.emit('menu_item_updated', item);

  res.json({ success: true, item });
};
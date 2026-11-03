const express = require('express');
const router = express.Router();

const menu = require('../controllers/menuController');
const resCtrl = require('../controllers/reservationController');
const orders = require('../controllers/orderController');
const admin = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { requireRole } = require('../middleware/auth');

router.get('/auth/me', authController.me);
router.post('/auth/register', authController.registerCustomer);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// Menu
router.get('/menu', menu.getMenu);
router.post('/menu', requireRole('staff'), menu.addDish);
router.patch('/menu/:id/toggle', requireRole('staff'), menu.toggleAvailability);

// Reservations
router.get('/reservations/mine', requireRole('customer'), resCtrl.getMyReservations);
router.get('/reservations', requireRole('staff'), resCtrl.getReservations);
router.post('/reservations', requireRole('customer'), resCtrl.createReservation);
router.patch('/reservations/:id/status', requireRole('staff'), resCtrl.updateStatus);

// Orders
router.get('/orders/mine', requireRole('customer'), orders.getMyOrders);
router.get('/orders', requireRole('staff'), orders.getOrders);
router.post('/orders', requireRole('customer'), orders.createOrder);
router.patch('/orders/:id/status', requireRole('staff'), orders.updateStatus);

// Notifications
router.get('/admin/notifications', requireRole('staff'), admin.getNotifications);

module.exports = router;
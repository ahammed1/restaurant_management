const db = require('../config/db');
const notif = require('../services/notificationService');

exports.getReservations = (req, res) => {
  res.json({
    success: true,
    reservations: db.getReservations(req.query.date),
    tables: db.getTables()
  });
};

exports.getMyReservations = (req, res) => {
  res.json({
    success: true,
    reservations: db.getReservationsForCustomer(req.user.id)
  });
};

exports.createReservation = async (req, res) => {
  const { date, timeSlot, partySize, zone } = req.body;
  const guests = Number.parseInt(partySize, 10);
  const validTimeSlots = ['12:30 PM', '1:30 PM', '7:30 PM', '8:15 PM', '9:00 PM'];
  const validZones = ['Any', 'Main Dining Hall', 'Window Booth', 'Garden Terrace'];

  if (
    typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
    !validTimeSlots.includes(timeSlot) ||
    (zone !== undefined && !validZones.includes(zone)) ||
    !Number.isInteger(guests) || guests < 1 || guests > 12
  ) {
    return res.status(400).json({ success: false, message: 'Please provide valid reservation details.' });
  }

  const table = db.findAvailableTable(date, timeSlot, guests, zone);
  if (!table) {
    return res.status(409).json({ success: false, message: 'No table is available for that time slot.' });
  }

  const reservation = db.createReservation({
    ...req.body,
    customerId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    customerPhone: req.user.phone,
    partySize: guests,
    tableNumber: table.number,
    zone: table.zone
  });

  await notif.sendReservationConfirmation(reservation);
  res.status(201).json({ success: true, reservation });
};

exports.updateStatus = (req, res) => {
  if (!['CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'].includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'Invalid reservation status.' });
  }
  const reservation = db.updateReservationStatus(req.params.id, req.body.status);
  if (!reservation) {
    return res.status(404).json({ success: false, message: 'Reservation not found.' });
  }

  res.json({ success: true, reservation });
};
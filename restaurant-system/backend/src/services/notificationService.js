const db = require('../config/db');

class NotificationService {
  async dispatch(type, recipient, content, subject = "") {
    const record = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      type,
      recipient,
      content,
      subject,
      time: "Just now"
    };

    db.addNotification(record);
    console.log(`[${type} Dispatched] To: ${recipient} | Content: ${content}`);
    return record;
  }

  async sendReservationConfirmation(r) {
    const msg = `Aura Dining: Table #${r.id} confirmed for ${r.partySize} guests on ${r.date} at ${r.timeSlot} (Table #${r.tableNumber}, ${r.zone}).`;
    await this.dispatch("SMS", r.customerPhone, msg);
    await this.dispatch("EMAIL", r.customerEmail, msg, `Table Booking Confirmed #${r.id}`);
  }

  async sendOrderConfirmation(order) {
    const msg = `Aura Dining: Order #${order.id} received ($${order.totalAmount.toFixed(2)}). Sent to kitchen for immediate prep.`;
    await this.dispatch("SMS", order.customerPhone, msg);
  }

  async sendOrderStatusUpdate(order) {
    if (order.status === 'READY') {
      const msg = order.orderType === 'DINE_IN'
        ? `Aura Dining: Order #${order.id} is PLATED & READY! Serving to Table #${order.tableNumber}.`
        : `Aura Dining: Order #${order.id} is READY for takeaway pickup!`;
      await this.dispatch("SMS", order.customerPhone, msg);
    }
  }
}

module.exports = new NotificationService();
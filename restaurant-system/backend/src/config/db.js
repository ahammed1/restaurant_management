const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/restaurant_store.json');

const INITIAL_DATA = {
  restaurant: {
    name: "Aura Modern Dining & Kitchen",
    address: "100 Feet Road, Indiranagar, Bengaluru",
    phone: "+91 80 4920 1200",
    email: "concierge@auradining.com"
  },
  tables: [
    { id: "T-01", number: 1, capacity: 2, zone: "Main Dining Hall", status: "AVAILABLE" },
    { id: "T-02", number: 2, capacity: 2, zone: "Main Dining Hall", status: "AVAILABLE" },
    { id: "T-03", number: 3, capacity: 4, zone: "Main Dining Hall", status: "OCCUPIED" },
    { id: "T-04", number: 4, capacity: 4, zone: "Main Dining Hall", status: "AVAILABLE" },
    { id: "T-05", number: 5, capacity: 6, zone: "Main Dining Hall", status: "AVAILABLE" },
    { id: "T-06", number: 6, capacity: 8, zone: "Main Dining Hall", status: "RESERVED" },
    { id: "T-07", number: 7, capacity: 2, zone: "Window Booth", status: "OCCUPIED" },
    { id: "T-08", number: 8, capacity: 4, zone: "Window Booth", status: "AVAILABLE" },
    { id: "T-09", number: 9, capacity: 4, zone: "Window Booth", status: "AVAILABLE" },
    { id: "T-10", number: 10, capacity: 2, zone: "Garden Terrace", status: "AVAILABLE" },
    { id: "T-11", number: 11, capacity: 4, zone: "Garden Terrace", status: "AVAILABLE" },
    { id: "T-12", number: 12, capacity: 6, zone: "Garden Terrace", status: "AVAILABLE" }
  ],
  categories: [
    { id: "cat-starters", name: "Starters & Small Plates", icon: "🥟" },
    { id: "cat-mains", name: "Mains & Entrees", icon: "🥩" },
    { id: "cat-pizzas", name: "Artisan Wood-Fired Pizzas", icon: "🍕" },
    { id: "cat-desserts", name: "Decadent Desserts", icon: "🍮" },
    { id: "cat-beverages", name: "Cocktails & Drinks", icon: "🍹" }
  ],
  menuItems: [
    { id: "menu-01", categoryId: "cat-starters", name: "Truffle Wild Mushroom Arancini", description: "Crispy arborio risotto spheres with black truffle & fontina center.", price: 14.50, isAvailable: true, prepTime: "12m", badge: "Chef Special" },
    { id: "menu-02", categoryId: "cat-starters", name: "Crispy Calamari Fritti", description: "Point judith squid, shishito peppers, lemon caper remoulade.", price: 16.00, isAvailable: true, prepTime: "10m", badge: "Popular" },
    { id: "menu-03", categoryId: "cat-starters", name: "Smoked Burrata Bruschetta", description: "Heirloom tomato confit, aged balsamic, basil oil, sourdough.", price: 15.50, isAvailable: true, prepTime: "8m", badge: null },
    { id: "menu-05", categoryId: "cat-mains", name: "Pan-Seared Chilean Sea Bass", description: "Saffron risotto, asparagus spears, citrus beurre blanc.", price: 34.00, isAvailable: true, prepTime: "20m", badge: "Signature" },
    { id: "menu-06", categoryId: "cat-mains", name: "Prime Angus Ribeye Steak 10oz", description: "Hand-cut beef, rosemary fingerling potatoes, truffle butter.", price: 38.50, isAvailable: true, prepTime: "22m", badge: "Chef Special" },
    { id: "menu-07", categoryId: "cat-mains", name: "Slow-Braised Pappardelle Bolognese", description: "Handmade pasta ribbons with 8-hour braised beef ragù.", price: 22.50, isAvailable: true, prepTime: "16m", badge: "Classic" },
    { id: "menu-10", categoryId: "cat-pizzas", name: "Wood-Fired Margherita Classico", description: "San Marzano tomatoes, fresh fior di latte, sweet basil, EVOO.", price: 18.00, isAvailable: true, prepTime: "12m", badge: "Bestseller" },
    { id: "menu-11", categoryId: "cat-pizzas", name: "Calabrian Diavola Pepperoni", description: "Artisanal spicy soppressata, smoked mozzarella, hot honey.", price: 20.50, isAvailable: true, prepTime: "12m", badge: "Hot" },
    { id: "menu-13", categoryId: "cat-desserts", name: "Traditional Espresso Tiramisu", description: "Espresso ladyfingers, velvety mascarpone, valrhona cocoa.", price: 10.50, isAvailable: true, prepTime: "5m", badge: "Favorite" },
    { id: "menu-15", categoryId: "cat-beverages", name: "Smoked Rosemary Old Fashioned", description: "Kentucky bourbon, aromatic bitters, flamed rosemary sprig.", price: 14.00, isAvailable: true, prepTime: "5m", badge: "Signature Cocktail" },
    { id: "menu-16", categoryId: "cat-beverages", name: "Yuzu Passionfruit Botanical Spritz", description: "Japanese yuzu extract, passionfruit, sparkling soda, fresh mint.", price: 8.50, isAvailable: true, prepTime: "4m", badge: "Mocktail" }
  ],
  reservations: [
    { id: "RES-701", customerName: "Aarav Mehta", customerPhone: "+91 98450 11223", partySize: 4, date: new Date().toISOString().split('T')[0], timeSlot: "19:30", tableNumber: 3, zone: "Main Dining Hall", status: "SEATED", createdAt: new Date().toISOString() },
    { id: "RES-702", customerName: "Elena Rostova", customerPhone: "+91 98711 55443", partySize: 2, date: new Date().toISOString().split('T')[0], timeSlot: "20:00", tableNumber: 7, zone: "Window Booth", status: "CONFIRMED", createdAt: new Date().toISOString() }
  ],
  customers: [],
  orders: [
    {
      id: "ORD-101",
      orderType: "DINE_IN",
      tableNumber: 3,
      customerName: "Aarav Mehta",
      customerPhone: "+91 98450 11223",
      items: [
        { name: "Truffle Wild Mushroom Arancini", quantity: 2, price: 14.50 },
        { name: "Pan-Seared Chilean Sea Bass", quantity: 2, price: 34.00 }
      ],
      totalAmount: 101.85,
      status: "PREPARING",
      createdAt: new Date().toISOString()
    }
  ],
  notifications: []
};

class Database {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        if (!Array.isArray(data.customers)) data.customers = [];
        return data;
      }
    } catch (e) {
      console.warn("Initializing fresh data store.");
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveData(dataToSave) {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave || this.data, null, 2));
    } catch (e) {
      console.error("Save error:", e.message);
    }
  }

  getMenuItems(cat, search) {
    let items = this.data.menuItems;
    if (cat && cat !== 'all') items = items.filter(i => i.categoryId === cat);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return items;
  }

  toggleItemAvailability(id) {
    const item = this.data.menuItems.find(i => i.id === id);
    if (!item) return null;
    item.isAvailable = !item.isAvailable;
    this.saveData();
    return item;
  }

  addMenuItem(item) {
    this.data.menuItems.push(item);
    this.saveData();
    return item;
  }

  getTables() { return this.data.tables; }

  findCustomerByEmail(email) {
    return this.data.customers.find(customer => customer.email === email);
  }

  addCustomer(customer) {
    this.data.customers.push(customer);
    this.saveData();
    return customer;
  }

  getReservations(date) {
    let res = this.data.reservations;
    if (date) res = res.filter(r => r.date === date);
    return res.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getReservationsForCustomer(customerId) {
    return this.data.reservations
      .filter(reservation => reservation.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findAvailableTable(date, timeSlot, partySize, zone) {
    const bookedTableIds = this.data.reservations
      .filter(r => r.date === date && r.timeSlot === timeSlot && r.status !== 'CANCELLED')
      .map(r => r.tableNumber);

    let candidates = this.data.tables.filter(t => !bookedTableIds.includes(t.number) && t.capacity >= partySize);
    if (zone && zone !== 'Any') {
      const zoneMatch = candidates.filter(t => t.zone.toLowerCase().includes(zone.toLowerCase()));
      if (zoneMatch.length > 0) candidates = zoneMatch;
    }
    candidates.sort((a, b) => a.capacity - b.capacity);
    return candidates[0] || null;
  }

  createReservation(booking) {
    const newId = `RES-${Math.floor(100 + Math.random() * 900)}`;
    const record = {
      id: newId,
      customerId: booking.customerId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail || "guest@example.com",
      customerPhone: booking.customerPhone,
      partySize: parseInt(booking.partySize, 10),
      date: booking.date,
      timeSlot: booking.timeSlot,
      tableNumber: booking.tableNumber,
      zone: booking.zone,
      status: "CONFIRMED",
      createdAt: new Date().toISOString()
    };
    this.data.reservations.unshift(record);
    this.saveData();
    return record;
  }

  updateReservationStatus(id, status) {
    const res = this.data.reservations.find(r => r.id === id);
    if (!res) return null;
    res.status = status;
    const table = this.data.tables.find(t => t.number === res.tableNumber);
    if (table) {
      if (status === 'SEATED') table.status = 'OCCUPIED';
      else if (status === 'COMPLETED' || status === 'CANCELLED') table.status = 'AVAILABLE';
    }
    this.saveData();
    return res;
  }

  getOrders(status) {
    let orders = this.data.orders;
    if (status && status !== 'all') orders = orders.filter(o => o.status === status);
    return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getOrdersForCustomer(customerId) {
    return this.data.orders
      .filter(order => order.customerId === customerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  createOrder(data) {
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;

    const record = {
      id: newId,
      customerId: data.customerId,
      orderType: data.orderType || "DINE_IN",
      tableNumber: data.tableNumber || null,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      items: data.items,
      subtotal,
      tax,
      totalAmount,
      status: "RECEIVED",
      createdAt: new Date().toISOString()
    };
    this.data.orders.unshift(record);
    this.saveData();
    return record;
  }

  updateOrderStatus(id, status) {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return null;
    order.status = status;
    this.saveData();
    return order;
  }

  addNotification(record) {
    const item = { id: `NOTIF-${Date.now().toString().slice(-6)}`, timestamp: new Date().toISOString(), ...record };
    this.data.notifications.unshift(item);
    if (this.data.notifications.length > 50) this.data.notifications.pop();
    this.saveData();
    return item;
  }

  getNotifications() { return this.data.notifications; }

  getMetrics() {
    const totalSales = this.data.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const activeOrders = this.data.orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
    const occupiedTables = this.data.tables.filter(t => t.status === 'OCCUPIED').length;
    return {
      totalSales: Math.round(totalSales * 100) / 100,
      activeOrders,
      todayReservations: this.data.reservations.length,
      occupancyRate: Math.round((occupiedTables / this.data.tables.length) * 100)
    };
  }
}

module.exports = new Database();
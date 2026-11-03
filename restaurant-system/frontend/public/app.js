// Connects to Express Socket.IO or falls back to local event bus
const socket = (typeof io !== 'undefined') ? io({ autoConnect: false }) : null;

const DEFAULT_MENU = [
  { id: "menu-01", categoryId: "cat-starters", name: "Truffle Wild Mushroom Arancini", description: "Crispy arborio risotto spheres infused with black winter truffle, fontina center, garlic aioli.", price: 14.50, isAvailable: true, badge: "Chef Special" },
  { id: "menu-02", categoryId: "cat-starters", name: "Crispy Calamari Fritti", description: "Flash-fried point judith squid, blistered shishito peppers, lemon caper remoulade.", price: 16.00, isAvailable: true, badge: "Popular" },
  { id: "menu-03", categoryId: "cat-starters", name: "Smoked Burrata Bruschetta", description: "Heirloom cherry tomato confit, aged modena balsamic, fresh basil oil, toasted sourdough.", price: 15.50, isAvailable: true, badge: null },
  { id: "menu-04", categoryId: "cat-starters", name: "Spiced Paneer Tikka Skewers", description: "Tandoor-charred cottage cheese marinated in kashmiri chili, hung curd, mint relish.", price: 13.50, isAvailable: true, badge: null },
  { id: "menu-05", categoryId: "cat-mains", name: "Pan-Seared Chilean Sea Bass", description: "Saffron lemon risotto, tender asparagus spears, champagne citrus beurre blanc.", price: 34.00, isAvailable: true, badge: "Signature" },
  { id: "menu-06", categoryId: "cat-mains", name: "Prime Angus Ribeye Steak 10oz", description: "Hand-cut grain-fed beef, rosemary roasted baby potatoes, truffle butter.", price: 38.50, isAvailable: true, badge: "Chef Special" },
  { id: "menu-07", categoryId: "cat-mains", name: "Slow-Braised Pappardelle Bolognese", description: "Handmade wide ribbons, 8-hour braised heritage beef ragù, parmigiano reggiano.", price: 22.50, isAvailable: true, badge: "Classic" },
  { id: "menu-08", categoryId: "cat-mains", name: "Royal Murgh Butter Chicken", description: "Clay oven charred chicken morsels in rich velvety tomato makhani with fenugreek butter.", price: 24.00, isAvailable: true, badge: "Popular" },
  { id: "menu-10", categoryId: "cat-pizzas", name: "Wood-Fired Margherita Classico", description: "San Marzano D.O.P. tomatoes, fresh fior di latte mozzarella, sweet basil, cold-pressed EVOO.", price: 18.00, isAvailable: true, badge: "Bestseller" },
  { id: "menu-11", categoryId: "cat-pizzas", name: "Calabrian Diavola Pepperoni", description: "Artisanal spicy soppressata, smoked provolone, crushed red pepper, wildflower honey.", price: 20.50, isAvailable: true, badge: "Hot" },
  { id: "menu-12", categoryId: "cat-pizzas", name: "Truffle Bianca & Funghi", description: "Roasted garlic ricotta cream, taleggio cheese, shiitake medley, baby organic arugula.", price: 22.00, isAvailable: true, badge: null },
  { id: "menu-13", categoryId: "cat-desserts", name: "Traditional Espresso Tiramisu", description: "Espresso-dipped savoiardi ladyfingers, velvety mascarpone sabayon, valrhona cocoa dusting.", price: 10.50, isAvailable: true, badge: "Favorite" },
  { id: "menu-14", categoryId: "cat-desserts", name: "Warm Valrhona Chocolate Lava Cake", description: "Molten dark chocolate ganache center, madagascar bourbon vanilla bean gelato.", price: 12.00, isAvailable: true, badge: "Signature" },
  { id: "menu-15", categoryId: "cat-beverages", name: "Smoked Rosemary Old Fashioned", description: "Kentucky bourbon, demerara, angostura bitters, torched rosemary sprig, expressed orange peel.", price: 14.00, isAvailable: true, badge: "Signature Cocktail" },
  { id: "menu-16", categoryId: "cat-beverages", name: "Yuzu Passionfruit Botanical Spritz", description: "Japanese yuzu extract, passionfruit coulis, sparkling club soda, fresh mint blossom.", price: 8.50, isAvailable: true, badge: "Mocktail" }
];

const DEFAULT_TABLES = [
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
];

const STATE = {
  menu: [...DEFAULT_MENU],
  tables: [...DEFAULT_TABLES],
  orders: [],
  reservations: [],
  notifications: [],
  cart: [],
  activeCategory: 'all',
  searchQuery: '',
  currentOrderType: 'DINE_IN',
  activeOrder: null,
  user: null,
  authRole: 'customer',
  authMode: 'login'
};

async function initApp() {
  if (socket) {
    socket.on('menu_item_updated', (item) => {
      const idx = STATE.menu.findIndex(m => m.id === item.id);
      if (idx !== -1) STATE.menu[idx] = item;
      renderMenu();
      if (STATE.user && STATE.user.role === 'staff') renderStockManager();
    });
    socket.on('new_order_placed', (order) => {
      if (!STATE.user || STATE.user.role !== 'staff') return;
      STATE.orders.unshift(order);
      renderKDS();
      showToast(`New Kitchen Order #${order.id}!`, "🔔");
    });
    socket.on('order_status_updated', (order) => {
      if (!STATE.user || STATE.user.role !== 'staff') return;
      const idx = STATE.orders.findIndex(o => o.id === order.id);
      if (idx !== -1) STATE.orders[idx] = order;
      renderKDS();
    });
    socket.on('order_status_changed', (order) => {
      if (!STATE.user || STATE.user.role !== 'customer') return;
      const idx = STATE.orders.findIndex(o => o.id === order.id);
      if (idx !== -1) STATE.orders[idx] = order;
      if (STATE.activeOrder && STATE.activeOrder.id === order.id) {
        STATE.activeOrder = order;
        renderTracker();
      }
    });
  }

  try {
    const response = await fetch('/api/auth/me').then(r => r.json());
    if (response.user) await showDashboard(response.user);
  } catch (err) {
    document.getElementById('auth-error').innerText = 'Could not connect to the server. Please try again.';
  }
}

async function showDashboard(user) {
  STATE.user = user;
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-shell').style.display = 'block';
  document.getElementById('session-name').textContent = user.name;
  document.getElementById('btn-customer-portal').style.display = user.role === 'customer' ? '' : 'none';
  document.getElementById('btn-staff-portal').style.display = user.role === 'staff' ? '' : 'none';
  document.getElementById('notifications-button').style.display = user.role === 'staff' ? '' : 'none';
  document.getElementById('cart-button').style.display = user.role === 'customer' ? '' : 'none';

  const isStaff = user.role === 'staff';
  const [menuRes, resRes, ordersRes] = await Promise.all([
    fetch('/api/menu').then(r => r.json()),
    fetch(isStaff ? '/api/reservations' : '/api/reservations/mine').then(r => r.json()),
    fetch(isStaff ? '/api/orders' : '/api/orders/mine').then(r => r.json())
  ]);
  if (menuRes.success) STATE.menu = menuRes.items;
  if (resRes.success) {
    STATE.reservations = resRes.reservations;
    if (resRes.tables) STATE.tables = resRes.tables;
  }
  if (ordersRes.success) STATE.orders = ordersRes.orders;
  STATE.activeOrder = STATE.orders[0] || null;

  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('res-date');
  if (dateInput) { dateInput.value = today; dateInput.min = today; }
  document.getElementById('res-name').value = user.name;
  document.getElementById('res-phone').value = user.phone || '';
  document.getElementById('res-email').value = user.email;
  document.getElementById('cart-customer-name').value = user.name;
  document.getElementById('cart-customer-phone').value = user.phone || '';

  renderMenu();
  if (socket && !socket.connected) socket.connect();
  switchPortal(user.role);
}

function selectAuthRole(role) {
  STATE.authRole = role;
  STATE.authMode = 'login';
  document.getElementById('auth-customer-role').classList.toggle('active', role === 'customer');
  document.getElementById('auth-staff-role').classList.toggle('active', role === 'staff');
  document.getElementById('auth-register-fields').style.display = 'none';
  document.getElementById('auth-name').required = false;
  document.getElementById('auth-phone').required = false;
  document.getElementById('auth-title').innerText = role === 'customer' ? 'Customer sign in' : 'Staff sign in';
  document.getElementById('auth-description').innerText = role === 'customer'
    ? 'Sign in to place orders and manage your reservations.'
    : 'Sign in to access restaurant operations.';
  document.getElementById('auth-submit').innerText = `Sign in as ${role}`;
  document.getElementById('auth-switch').style.display = role === 'customer' ? '' : 'none';
  document.getElementById('auth-error').innerText = '';
}

function toggleAuthMode() {
  if (STATE.authRole !== 'customer') return;
  STATE.authMode = STATE.authMode === 'login' ? 'register' : 'login';
  const registering = STATE.authMode === 'register';
  document.getElementById('auth-register-fields').style.display = registering ? 'grid' : 'none';
  document.getElementById('auth-name').required = registering;
  document.getElementById('auth-phone').required = registering;
  document.getElementById('auth-title').innerText = registering ? 'Create customer account' : 'Customer sign in';
  document.getElementById('auth-submit').innerText = registering ? 'Create account' : 'Sign in as customer';
  document.getElementById('auth-switch').innerHTML = registering
    ? 'Already registered? <button type="button" onclick="toggleAuthMode()">Sign in</button>'
    : 'New customer? <button type="button" onclick="toggleAuthMode()">Create an account</button>';
  document.getElementById('auth-error').innerText = '';
}

async function submitAuth(event) {
  event.preventDefault();
  const registering = STATE.authRole === 'customer' && STATE.authMode === 'register';
  const body = {
    role: STATE.authRole,
    email: document.getElementById('auth-email').value,
    password: document.getElementById('auth-password').value
  };
  if (registering) {
    body.name = document.getElementById('auth-name').value;
    body.phone = document.getElementById('auth-phone').value;
  }
  try {
    const response = await fetch(registering ? '/api/auth/register' : '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(r => r.json());
    if (!response.success) {
      document.getElementById('auth-error').innerText = response.message || 'Sign in failed.';
      return;
    }
    document.getElementById('auth-error').innerText = '';
    await showDashboard(response.user);
  } catch (err) {
    document.getElementById('auth-error').innerText = 'Could not connect to the server. Please try again.';
  }
}

async function logout() {
  if (socket) socket.disconnect();
  await fetch('/api/auth/logout', { method: 'POST' });
  STATE.user = null;
  STATE.orders = [];
  STATE.reservations = [];
  STATE.cart = [];
  STATE.activeOrder = null;
  updateCart();
  document.getElementById('app-shell').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('auth-password').value = '';
  selectAuthRole('customer');
}

// Portal Navigation
function switchPortal(portal) {
  if (!STATE.user || STATE.user.role !== portal) return;
  document.getElementById('btn-customer-portal').classList.toggle('active', portal === 'customer');
  document.getElementById('btn-staff-portal').classList.toggle('active', portal === 'staff');
  document.getElementById('customer-subnav').style.display = portal === 'customer' ? 'block' : 'none';
  document.getElementById('staff-subnav').style.display = portal === 'staff' ? 'block' : 'none';
  if (portal === 'customer') switchCustomerTab('menu');
  else switchStaffTab('kds');
}

function switchCustomerTab(tab) {
  document.querySelectorAll('#customer-subnav .subnav-item').forEach((el, i) => {
    el.classList.toggle('active', (tab === 'menu' && i === 0) || (tab === 'reservation' && i === 1) || (tab === 'tracker' && i === 2));
  });
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`view-customer-${tab}`).classList.add('active');
  if (tab === 'tracker') renderTracker();
}

function switchStaffTab(tab) {
  document.querySelectorAll('#staff-subnav .subnav-item').forEach((el, i) => {
    el.classList.toggle('active', (tab === 'kds' && i === 0) || (tab === 'floor' && i === 1) || (tab === 'stock' && i === 2));
  });
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`view-staff-${tab}`).classList.add('active');
  if (tab === 'kds') renderKDS();
  if (tab === 'floor') renderFloor();
  if (tab === 'stock') renderStockManager();
}

// Drawer Toggles
function toggleDrawer(id) {
  const d = document.getElementById(id);
  const o = document.getElementById(`${id}-overlay`);
  const active = d.classList.contains('active');
  d.classList.toggle('active', !active);
  o.classList.toggle('active', !active);
  if (!active && id === 'notif-drawer') loadNotifications();
}

function showToast(msg, icon = "✅") {
  const t = document.getElementById('toast');
  document.getElementById('toast-icon').innerText = icon;
  document.getElementById('toast-text').innerText = msg;
  t.style.display = 'flex';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

// Menu Logic
function renderMenu() {
  let items = STATE.menu;
  if (STATE.activeCategory !== 'all') items = items.filter(i => i.categoryId === STATE.activeCategory);
  if (STATE.searchQuery) {
    const q = STATE.searchQuery.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }
  document.getElementById('menu-items-grid').innerHTML = items.map(item => `
    <div class="menu-card ${!item.isAvailable ? 'sold-out' : ''}">
      <div>
        <div style="display:flex; justify-content:space-between;">
          <h4>${item.name}</h4>
          ${!item.isAvailable ? '<span class="badge-tag badge-sold-out">86ed</span>' : item.badge ? `<span class="badge-tag badge-chef">${item.badge}</span>` : ''}
        </div>
        <p class="menu-desc">${item.description}</p>
      </div>
      <div class="menu-card-footer">
        <span class="menu-price">$${item.price.toFixed(2)}</span>
        <button class="btn-add" ${!item.isAvailable ? 'disabled' : ''} onclick="addToCart('${item.id}')">+ Add</button>
      </div>
    </div>
  `).join('');
}

function filterMenu(cat) {
  STATE.activeCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${cat}'`)));
  renderMenu();
}

function handleSearch(val) {
  STATE.searchQuery = val;
  renderMenu();
}

// Cart Logic
function addToCart(id) {
  const item = STATE.menu.find(i => i.id === id);
  if (!item || !item.isAvailable) return;
  const existing = STATE.cart.find(c => c.id === id);
  if (existing) existing.quantity += 1;
  else STATE.cart.push({ id: item.id, name: item.name, price: item.price, quantity: 1 });
  updateCart();
  showToast(`Added ${item.name}!`);
}

function updateCart() {
  const count = STATE.cart.reduce((s, i) => s + i.quantity, 0);
  document.getElementById('cart-badge-count').innerText = count;

  let subtotal = 0;
  const list = document.getElementById('cart-items-list');
  if (STATE.cart.length === 0) {
    list.innerHTML = `<p style="color:var(--text-muted);font-size:12px;text-align:center;">Cart is empty.</p>`;
  } else {
    list.innerHTML = STATE.cart.map(i => {
      subtotal += i.price * i.quantity;
      return `<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;">
        <span>${i.quantity}x ${i.name}</span>
        <span>$${(i.price * i.quantity).toFixed(2)}</span>
      </div>`;
    }).join('');
  }

  const tax = subtotal * 0.05;
  document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
  document.getElementById('cart-tax').innerText = `$${tax.toFixed(2)}`;
  document.getElementById('cart-total').innerText = `$${(subtotal + tax).toFixed(2)}`;
}

function setOrderType(type) {
  STATE.currentOrderType = type;
  document.getElementById('order-type-dinein').classList.toggle('active', type === 'DINE_IN');
  document.getElementById('order-type-takeaway').classList.toggle('active', type === 'TAKEAWAY');
  document.getElementById('table-select-group').style.display = type === 'DINE_IN' ? 'block' : 'none';
}

async function submitOrder() {
  if (STATE.cart.length === 0) return showToast("Cart is empty!", "⚠️");
  const payload = {
    orderType: STATE.currentOrderType,
    tableNumber: STATE.currentOrderType === 'DINE_IN' ? document.getElementById('cart-table-select').value : null,
    customerName: document.getElementById('cart-customer-name').value || "Guest",
    customerPhone: document.getElementById('cart-customer-phone').value || "+91 98450 12345",
    items: [...STATE.cart]
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success) {
      STATE.activeOrder = res.order;
      STATE.cart = [];
      updateCart();
      toggleDrawer('cart-drawer');
      showToast(`Order #${res.order.id} Placed!`, "🚀");
      switchCustomerTab('tracker');
    }
  } catch (e) {
    showToast("Failed to place order", "❌");
  }
}

// Reservation Logic
function selectSlot(el, slot) {
  document.querySelectorAll('#time-slot-chips .slot-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

async function handleReservationSubmit(e) {
  e.preventDefault();
  const slotEl = document.querySelector('#time-slot-chips .slot-chip.active');
  const payload = {
    date: document.getElementById('res-date').value,
    partySize: document.getElementById('res-party-size').value,
    zone: document.getElementById('res-zone').value,
    timeSlot: slotEl ? slotEl.innerText : '19:30',
    customerName: document.getElementById('res-name').value,
    customerPhone: document.getElementById('res-phone').value,
    customerEmail: document.getElementById('res-email').value
  };

  try {
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());

    if (res.success) {
      showToast(`Reservation #${res.reservation.id} Confirmed!`, "🎉");
      e.target.reset();
    } else {
      showToast(res.message || "Slot unavailable", "⚠️");
    }
  } catch (err) {
    showToast("Booking failed", "❌");
  }
}

// Live Tracker
function renderTracker() {
  const o = STATE.activeOrder;
  if (!o) return;
  document.getElementById('track-order-title').innerText = `Order #${o.id}`;
  document.getElementById('track-order-subtitle').innerText = `${o.orderType === 'DINE_IN' ? `Table #${o.tableNumber}` : 'Takeaway'} • Total: $${o.totalAmount.toFixed(2)}`;

  const badge = document.getElementById('track-order-badge');
  const bar = document.getElementById('tracker-bar');
  const nodes = [1, 2, 3, 4].map(n => document.getElementById(`step-node-${n}`));
  nodes.forEach(n => n.className = 'step-node');

  if (o.status === 'RECEIVED') {
    badge.innerText = 'RECEIVED'; bar.style.width = '10%'; nodes[0].classList.add('active');
  } else if (o.status === 'PREPARING') {
    badge.innerText = 'COOKING'; bar.style.width = '45%'; nodes[0].classList.add('completed'); nodes[1].classList.add('active');
  } else if (o.status === 'READY') {
    badge.innerText = 'PLATED & READY'; bar.style.width = '75%'; nodes[0].classList.add('completed'); nodes[1].classList.add('completed'); nodes[2].classList.add('active');
  } else {
    badge.innerText = 'COMPLETED'; bar.style.width = '100%'; nodes.forEach(n => n.classList.add('completed'));
  }

  document.getElementById('tracker-items-list').innerHTML = o.items.map(i => `
    <div style="display:flex;justify-content:space-between;font-size:13px;padding:3px 0;">
      <span>${i.quantity}x ${escapeHTML(i.name)}</span>
      <span>$${(i.price * i.quantity).toFixed(2)}</span>
    </div>
  `).join('');
}

// Staff KDS
function renderKDS() {
  const received = STATE.orders.filter(o => o.status === 'RECEIVED');
  const prep = STATE.orders.filter(o => o.status === 'PREPARING');
  const ready = STATE.orders.filter(o => o.status === 'READY');

  document.getElementById('kds-count-received').innerText = received.length;
  document.getElementById('kds-count-prep').innerText = prep.length;
  document.getElementById('kds-count-ready').innerText = ready.length;

  document.getElementById('kds-list-received').innerHTML = received.map(o => `
    <div class="kds-card">
      <div style="display:flex;justify-content:space-between;font-weight:700;"><span>#${o.id}</span><span>${o.orderType}</span></div>
      <div style="font-size:12px;">${o.items.map(i => `${i.quantity}x ${escapeHTML(i.name)}`).join(', ')}</div>
      <button class="kds-btn" style="background:#fef3c7;color:#92400e;" onclick="advanceOrder('${o.id}', 'PREPARING')">Start Cooking</button>
    </div>
  `).join('');

  document.getElementById('kds-list-prep').innerHTML = prep.map(o => `
    <div class="kds-card" style="border-left-color:var(--accent);">
      <div style="display:flex;justify-content:space-between;font-weight:700;"><span>#${o.id}</span><span>${o.orderType}</span></div>
      <div style="font-size:12px;">${o.items.map(i => `${i.quantity}x ${escapeHTML(i.name)}`).join(', ')}</div>
      <button class="kds-btn" style="background:#dcfce7;color:#166534;" onclick="advanceOrder('${o.id}', 'READY')">Mark Ready</button>
    </div>
  `).join('');

  document.getElementById('kds-list-ready').innerHTML = ready.map(o => `
    <div class="kds-card" style="border-left-color:var(--accent);">
      <div style="display:flex;justify-content:space-between;font-weight:700;"><span>#${o.id}</span><span>${o.orderType}</span></div>
      <div style="font-size:12px;">${o.items.map(i => `${i.quantity}x ${escapeHTML(i.name)}`).join(', ')}</div>
      <button class="kds-btn" style="background:#1e293b;color:white;" onclick="advanceOrder('${o.id}', 'COMPLETED')">Complete</button>
    </div>
  `).join('');
}

async function advanceOrder(id, nextStatus) {
  await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: nextStatus })
  });
}

// Staff Floor & Stock
function renderFloor() {
  document.getElementById('tables-floor-grid').innerHTML = STATE.tables.map(t => `
    <div class="table-box ${t.status.toLowerCase()}">
      <div style="font-weight:800;font-size:16px;">Table #${t.number}</div>
      <div style="font-size:11px;color:var(--text-muted);">${t.zone} (${t.capacity} seats)</div>
      <div style="font-weight:700;font-size:12px;margin-top:6px;">${t.status}</div>
    </div>
  `).join('');

  document.getElementById('reservations-table-body').innerHTML = STATE.reservations.map(r => `
    <tr>
      <td><strong>#${escapeHTML(r.id)}</strong></td>
      <td>${escapeHTML(r.customerName)}</td>
      <td>${escapeHTML(r.timeSlot)}</td>
      <td>${escapeHTML(r.partySize)}</td>
      <td>Table #${escapeHTML(r.tableNumber)}</td>
      <td><span class="badge-tag badge-chef">${escapeHTML(r.status)}</span></td>
      <td>${r.status === 'CONFIRMED' ? `<button onclick="seatRes('${r.id}')" style="font-size:11px;padding:3px 8px;cursor:pointer;">Seat</button>` : 'Seated'}</td>
    </tr>
  `).join('');
}

async function seatRes(id) {
  await fetch(`/api/reservations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'SEATED' })
  });
  const res = STATE.reservations.find(r => r.id === id);
  if (res) res.status = 'SEATED';
  renderFloor();
}

function renderStockManager() {
  document.getElementById('stock-manager-tbody').innerHTML = STATE.menu.map(item => `
    <tr>
      <td><strong>${item.name}</strong></td>
      <td>${item.categoryId.replace('cat-', '')}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td><span class="badge-tag ${item.isAvailable ? 'badge-chef' : 'badge-sold-out'}">${item.isAvailable ? 'In Stock' : '86ed'}</span></td>
      <td><button onclick="toggleStock('${item.id}')" style="padding:4px 8px;font-size:11px;cursor:pointer;">Toggle 86</button></td>
    </tr>
  `).join('');
}

async function toggleStock(id) {
  await fetch(`/api/menu/${id}/toggle`, { method: 'PATCH' });
}

// Notifications Stream
async function loadNotifications() {
  try {
    const res = await fetch('/api/admin/notifications').then(r => r.json());
    if (res.success) {
      document.getElementById('notif-badge-count').innerText = res.notifications.length;
      document.getElementById('notif-stream-body').innerHTML = res.notifications.map(n => `
        <div style="background:#f8fafc;padding:10px;border-radius:6px;border:1px solid #e2e8f0;font-size:12px;">
          <div style="font-weight:700;color:var(--text-muted);">${escapeHTML(n.type)} Alert • To: ${escapeHTML(n.recipient)}</div>
          <div style="margin-top:4px;">${escapeHTML(n.content)}</div>
        </div>
      `).join('');
    }
  } catch (e) {}
}

window.addEventListener('DOMContentLoaded', initApp);
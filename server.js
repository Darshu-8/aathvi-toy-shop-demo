const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const PRODUCTS_FILE = path.join(DATA, 'products.json');
const ORDERS_FILE = path.join(DATA, 'orders.json');
const ENQUIRIES_FILE = path.join(DATA, 'enquiries.json');
app.use(express.json({ limit: '30kb' }));
app.use(express.static(path.join(ROOT, 'public')));
const readJson = (file, fallback = []) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2));
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Aathvi Toy Shop API' }));
app.get('/api/config', (_req, res) => res.json({
  shopName: process.env.SHOP_NAME || 'AATHVI TOY SHOP', tagline: process.env.SHOP_TAGLINE || 'Little toys. Big imaginations.',
  phone: process.env.SHOP_PHONE || '', whatsapp: process.env.SHOP_WHATSAPP || '',
  address: process.env.SHOP_ADDRESS || 'N.T. Nagar, Pallapalayam Pirivu, Kannapalayam, Sulur, Tamil Nadu 641402',
  hours: process.env.SHOP_HOURS || 'Please contact the shop to confirm opening hours', mapsUrl: process.env.SHOP_MAPS_URL || 'https://maps.app.goo.gl/jqovcgE1CzDBMvjG6'
}));
app.get('/api/products', (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const q = String(req.query.q || '').trim().toLowerCase();
  res.json(q ? products.filter(p => `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)) : products);
});
app.post('/api/orders', (req, res) => {
  const { customer, items, paymentMethod } = req.body || {};
  if (!customer || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Add products and enter your delivery details.' });
  const name = String(customer.name || '').trim();
  const phone = String(customer.phone || '').trim();
  const address = String(customer.address || '').trim();
  if (name.length < 2 || name.length > 100 || !/^[+\d\s()-]{8,20}$/.test(phone) || address.length < 8 || address.length > 500) return res.status(400).json({ error: 'Please enter a valid name, phone number and full delivery address.' });
  const products = readJson(PRODUCTS_FILE);
  const safeItems = [];
  for (const item of items) {
    const product = products.find(p => p.id === Number(item.id));
    const qty = Number(item.quantity);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ error: 'One of the products or quantities is invalid. Please refresh and try again.' });
    safeItems.push({ id: product.id, name: product.name, price: product.price, quantity: qty, lineTotal: product.price * qty });
  }
  const total = safeItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const orders = readJson(ORDERS_FILE);
  const order = { id: 'AATHVI-' + Date.now().toString(36).toUpperCase(), customer: { name, phone, address }, items: safeItems, total, paymentMethod: paymentMethod === 'online' ? 'online_requested' : 'pay_on_delivery', paymentStatus: 'pending', status: 'Received — awaiting shop confirmation', createdAt: new Date().toISOString() };
  orders.unshift(order); writeJson(ORDERS_FILE, orders);
  res.status(201).json({ ok: true, order: { id: order.id, total: order.total, status: order.status }, message: 'Order request received! The shop must confirm availability and payment/delivery details.' });
});
// Optional private order dashboard API. Set ADMIN_KEY in the environment before using it.
app.get('/api/admin/orders', (req, res) => {
  const key = process.env.ADMIN_KEY;
  if (!key || req.get('x-admin-key') !== key) return res.status(401).json({ error: 'Admin access is not configured or the key is invalid.' });
  res.json(readJson(ORDERS_FILE));
});
app.post('/api/enquiries', (req, res) => {
  const { name, phone, message } = req.body || {};
  if (![name, phone, message].every(v => typeof v === 'string' && v.trim()) || [name, phone, message].some(v => v.length > 1000)) return res.status(400).json({ error: 'Please provide your name, phone number and message.' });
  const enquiries = readJson(ENQUIRIES_FILE);
  enquiries.push({ id: Date.now().toString(36), name: name.trim().slice(0,100), phone: phone.trim().slice(0,30), message: message.trim().slice(0,1000), createdAt: new Date().toISOString() });
  writeJson(ENQUIRIES_FILE, enquiries); res.status(201).json({ ok: true, message: 'Enquiry received.' });
});
app.get('*', (_req, res) => res.sendFile(path.join(ROOT, 'public', 'index.html')));
if (!fs.existsSync(ORDERS_FILE)) writeJson(ORDERS_FILE, []);
app.listen(PORT, () => console.log(`AATHVI TOY SHOP running at http://localhost:${PORT}`));

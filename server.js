const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ordersFile = path.join(__dirname, 'orders.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function readOrders() {
  try {
    if (!fs.existsSync(ordersFile)) return [];
    const data = fs.readFileSync(ordersFile, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading orders.json:', error);
    return [];
  }
}

function writeOrders(orders) {
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing orders.json:', error);
  }
}

app.post('/api/orders', (req, res) => {
  const { firstName, lastName, phone, plan, price } = req.body;

  if (!firstName || !lastName || !phone || !plan) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orders = readOrders();
  const newOrder = {
    id: Date.now(),
    firstName,
    lastName,
    phone,
    plan,
    price,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  writeOrders(orders);

  return res.json({ success: true, order: newOrder });
});

app.get('/api/orders', (req, res) => {
  return res.json(readOrders());
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Orders written to ${ordersFile}`);
});

export const insertOrder = `
INSERT INTO orders (number, status, customer_name, customer_phone, customer_email, delivery_method, delivery_type, delivery_city, delivery_address, delivery_pvz_code, delivery_pvz_name, delivery_price, delivery_eta, amount_total, currency, notes, payment_method)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'RUB', ?, ?)
`;

export const insertItem = `
INSERT INTO order_items (order_id, slug, name, price, qty, image)
VALUES (?, ?, ?, ?, ?, ?)
`;

export const byNumber = `SELECT * FROM orders WHERE number = ?`;
export const markStatus = `UPDATE orders SET status = ? WHERE id = ?`;
export const setPaymentId = `UPDATE orders SET cdekpay_payment_id = ? WHERE id = ?`;

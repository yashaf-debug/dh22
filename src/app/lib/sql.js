export const insertOrder = `
INSERT INTO orders (number, status, customer_name, customer_phone, customer_email, delivery_type, delivery_address, amount_total, currency, notes)
VALUES (?, 'new', ?, ?, ?, ?, ?, ?, 'RUB', ?)
`;

export const insertItem = `
INSERT INTO order_items (order_id, slug, name, price, qty, image)
VALUES (?, ?, ?, ?, ?, ?)
`;

export const byNumber = `SELECT * FROM orders WHERE number = ?`;
export const markStatus = `UPDATE orders SET status = ? WHERE id = ?`;
export const setPaymentId = `UPDATE orders SET cdekpay_payment_id = ? WHERE id = ?`;

import { Router } from 'express';
import crypto from 'crypto';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { config } from '../config.js';

const router = Router();

async function createRazorpayOrder(amountPaise, receipt) {
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${config.razorpayKeyId}:${config.razorpayKeySecret}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Razorpay order failed: ${err}`);
  }
  return res.json();
}

router.post('/create-order', requireAuth, async (req, res) => {
  const amountPaise = Math.max(0, Number(req.body.amount) || 0);
  const eventId = req.body.eventId || null;
  const receipt = `evt_${eventId || 'general'}_${Date.now()}`;

  let orderId;
  let mode = 'mock';

  if (config.razorpayKeyId && config.razorpayKeySecret && amountPaise > 0) {
    const order = await createRazorpayOrder(amountPaise, receipt);
    orderId = order.id;
    mode = 'razorpay';
  } else {
    orderId = `order_local_${crypto.randomUUID().slice(0, 8)}`;
  }

  await query(
    `INSERT INTO techastra_payments (user_id, event_id, order_id, amount_paise, status, meta)
     VALUES ($1, $2, $3, $4, 'created', $5::jsonb)`,
    [req.session.userId, eventId, orderId, amountPaise, JSON.stringify({ mode, receipt })],
  );

  const payment = {
    orderId,
    amount: amountPaise,
    currency: 'INR',
    keyId: config.razorpayKeyId || null,
    mode,
  };

  res.json({ success: true, payment, ...payment });
});

router.post('/verify', requireAuth, async (req, res) => {
  const orderId = req.body.orderId || req.body.razorpay_order_id;
  const paymentId = req.body.paymentId || req.body.razorpay_payment_id;
  const signature = req.body.signature || req.body.razorpay_signature;
  if (!orderId) return res.status(400).json({ message: 'orderId required' });

  const { rows } = await query('SELECT * FROM techastra_payments WHERE order_id = $1', [orderId]);
  const payment = rows[0];
  if (!payment) return res.status(404).json({ message: 'Order not found' });

  let verified = false;
  if (config.razorpayKeySecret && paymentId && signature) {
    const expected = crypto
      .createHmac('sha256', config.razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    verified = expected === signature;
  } else {
    verified = true;
  }

  if (verified) {
    await query(
      `UPDATE techastra_payments
       SET status = 'paid', razorpay_payment_id = $2, updated_at = now()
       WHERE order_id = $1`,
      [orderId, paymentId || 'mock_payment'],
    );
  }

  res.json({ success: verified, verified });
});

export default router;

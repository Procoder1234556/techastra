import { api } from './api';

export type PaymentOrder = {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string | null;
  mode: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

export function loadRazorpaySdk(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(!!window.Razorpay));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function createPaymentOrder(amountPaise: number, eventId: string) {
  const res = await api.post<{
    success?: boolean;
    payment?: PaymentOrder;
    orderId?: string;
    amount?: number;
    currency?: string;
    keyId?: string | null;
    mode?: string;
  }>('/api/v1/payment/create-order', { amount: amountPaise, eventId });

  const data = res.data;
  if (data.payment) return data.payment;
  return {
    orderId: data.orderId!,
    amount: data.amount!,
    currency: data.currency || 'INR',
    keyId: data.keyId ?? null,
    mode: data.mode || 'mock',
  };
}

export async function verifyPayment(
  orderId: string,
  razorpay: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string },
  eventId?: string,
) {
  const res = await api.post<{ success: boolean }>('/api/v1/payment/verify', {
    orderId,
    razorpay_order_id: razorpay.razorpay_order_id,
    razorpay_payment_id: razorpay.razorpay_payment_id,
    razorpay_signature: razorpay.razorpay_signature,
    eventId,
  });
  return res.data.success;
}

export async function runRazorpayCheckout(options: {
  amountPaise: number;
  eventId: string;
  description: string;
  prefill?: { name?: string; email?: string };
}): Promise<'paid' | 'mock' | 'skipped'> {
  const order = await createPaymentOrder(options.amountPaise, options.eventId);

  if (order.mode === 'mock' || !order.keyId) {
    await api.post('/api/v1/payment/verify', { orderId: order.orderId, eventId: options.eventId });
    return 'mock';
  }

  const loaded = await loadRazorpaySdk();
  if (!loaded || !window.Razorpay) {
    throw new Error('Razorpay checkout could not be loaded');
  }

  await new Promise<void>((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'Techastra',
      description: options.description,
      prefill: options.prefill,
      theme: { color: '#111111' },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const ok = await verifyPayment(order.orderId, response, options.eventId);
          if (!ok) reject(new Error('Payment verification failed'));
          else resolve();
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });
    rzp.on('payment.failed', (resp) => {
      reject(new Error(resp.error?.description || 'Payment failed'));
    });
    rzp.open();
  });

  return 'paid';
}

import { useState } from 'react';
import { paymentsApi } from '../api/water';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Remember: the webhook — not the frontend — is what actually confirms a
// payment. This component's job is just to open checkout and then wait,
// patiently, for the backend to say so. On Render's free tier the backend
// can be "asleep" (cold start) when a webhook arrives, adding real delay —
// so this needs to distinguish "still waiting" from "genuinely failed",
// rather than assuming a slow confirmation means a failed one.
export default function PayButton({ order, onPaid }) {
  const [status, setStatus] = useState('idle'); // idle | opening | confirming | slow | failed

  async function handlePay() {
    setStatus('opening');

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setStatus('failed');
      return;
    }

    let razorpayOrder;
    try {
      razorpayOrder = await paymentsApi.createOrder(order.id);
    } catch (err) {
      setStatus('failed');
      return;
    }

    const options = {
      key: razorpayOrder.razorpay_key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.razorpay_order_id,
      name: 'SkillMesh Water Delivery',
      description: `Order #${order.id} — ${order.quantity_liters}L`,
      handler: function () {
        setStatus('confirming');
        pollForConfirmation();
      },
      modal: {
        ondismiss: function () {
          if (status !== 'confirming') setStatus('idle');
        },
      },
      prefill: { contact: order.phone },
      theme: { color: '#4a5fd1' },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }

  function pollForConfirmation() {
    // Poll every 3 seconds for up to 3 minutes (60 attempts) — generous
    // enough to cover a Render free-tier cold start plus normal webhook
    // delivery time, so a genuinely successful payment doesn't get
    // reported as failed just because it took a little longer than usual.
    let attempts = 0;
    const maxAttempts = 60;

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const payment = await paymentsApi.status(order.id);
        if (payment?.status === 'success') {
          clearInterval(interval);
          onPaid();
          return;
        }
        // Only treat this as a REAL failure if Razorpay itself explicitly
        // reported payment.failed — not just because we're still waiting.
        if (payment?.status === 'failed') {
          clearInterval(interval);
          setStatus('failed');
          return;
        }
      } catch (err) {
        // network hiccup mid-poll — let it try again next tick
      }

      // After ~30 seconds of still waiting (not failing), switch to a
      // calmer "this is taking longer than usual" message instead of
      // continuing to just say "Confirming..." with no explanation.
      if (attempts === 10) {
        setStatus('slow');
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setStatus('slow'); // still NOT "failed" — we genuinely don't know, don't scare them
      }
    }, 3000);
  }

  if (status === 'confirming') {
    return <span className="payment-status">Confirming payment...</span>;
  }

  if (status === 'slow') {
    return (
      <div className="payment-status-slow">
        <span className="payment-status">
          Still confirming — this can take a little longer than usual. Your payment likely went
          through; refresh this page in a minute to check.
        </span>
        <button onClick={() => window.location.reload()} className="secondary">
          Refresh now
        </button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div>
        <span className="field-error">Payment could not be started. Please try again.</span>{' '}
        <button onClick={handlePay}>Try again</button>
      </div>
    );
  }

  return (
    <button onClick={handlePay} disabled={status === 'opening'}>
      {status === 'opening' ? 'Opening...' : 'Pay Now'}
    </button>
  );
}


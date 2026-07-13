import { useState } from 'react';
import { paymentsApi } from '../api/water';

// Loads Razorpay's checkout script on demand, the first time it's actually
// needed, instead of loading it on every page — most visits to the app
// never touch payments at all.
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

// Remember from Day 7: the webhook — not this frontend code — is the only
// thing that ever actually confirms a payment succeeded. This component's
// job is just to open the checkout modal and then POLL the backend to see
// what the webhook has recorded, rather than trusting Razorpay's in-browser
// "success" callback on its own.
export default function PayButton({ order, onPaid }) {
  const [status, setStatus] = useState('idle'); // idle | opening | confirming | failed

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
        // Razorpay says the checkout flow completed — but we don't mark
        // anything as paid here. We just start checking with our OWN
        // backend, which only knows a payment succeeded once the webhook
        // has actually landed.
        setStatus('confirming');
        pollForConfirmation();
      },
      modal: {
        ondismiss: function () {
          if (status !== 'confirming') setStatus('idle');
        },
      },
      prefill: {
        contact: order.phone,
      },
      theme: { color: '#4a5fd1' },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }

  function pollForConfirmation() {
    // Check every 2 seconds for up to ~30 seconds — the webhook usually
    // lands within a second or two of a successful payment, but this gives
    // a generous buffer for slower connections.
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const payment = await paymentsApi.status(order.id);
        if (payment?.status === 'success') {
          clearInterval(interval);
          onPaid();
        } else if (payment?.status === 'failed') {
          clearInterval(interval);
          setStatus('failed');
        }
      } catch (err) {
        // network hiccup mid-poll — just let it try again next tick
      }

      if (attempts >= 15) {
        clearInterval(interval);
        setStatus('failed');
      }
    }, 2000);
  }

  if (status === 'confirming') {
    return <span className="payment-status">Confirming payment...</span>;
  }

  if (status === 'failed') {
    return (
      <div>
        <span className="field-error">Payment could not be confirmed.</span>{' '}
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

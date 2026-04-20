/**
 * WhatsApp notifications via Meta Business Cloud API
 * Uses: WHATSAPP_TOKEN + WHATSAPP_PHONE_ID from environment variables
 *
 * HOW IT WORKS:
 * - When admin changes order status, this sends a WhatsApp message to the customer
 * - Uses free-form text messages (works within 24h of customer initiating chat)
 * - Falls back gracefully if customer hasn't messaged the business number first
 */

const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WA_TOKEN = process.env.WHATSAPP_TOKEN;

// Format Indian phone to E.164 → "91XXXXXXXXXX"
function formatPhone(raw) {
  let clean = String(raw).replace(/\D/g, '');
  if (clean.startsWith('0'))  clean = clean.slice(1);
  if (clean.length === 10)    clean = '91' + clean;
  // Already has country code
  if (!clean.startsWith('91')) clean = '91' + clean;
  return clean;
}

// Build the notification message for each status
function buildMessage(order) {
  const { trackingId, _id, billingDetails, items, total, status } = order;
  const tId = trackingId || `DP-${String(_id).slice(-4).toUpperCase()}`;
  const name = billingDetails?.firstName || 'Customer';

  const emoji = {
    'Packed':               '📦',
    'Waiting for Transport':'🚚',
    'Out for Delivery':     '🛵',
    'Delivered':            '✅',
    'Cancelled':            '❌',
  }[status] || '📄';

  const headline = {
    'Packed':               'Your order has been packed!',
    'Waiting for Transport':'Your order is waiting for pickup!',
    'Out for Delivery':     'Your order is out for delivery!',
    'Delivered':            'Your order has been delivered!',
    'Cancelled':            'Your order has been cancelled.',
  }[status] || 'Order status update';

  let text = `${emoji} *Dhakshitha Pickles*\n\nHi ${name}! ${headline}\n\n`;
  text += `*Order ID:* ${tId}\n*Status:* ${status}\n\n`;
  text += `*Items Ordered:*\n`;
  
  (items || []).forEach(i => {
    const w = i.weight === '250g' ? '250g' : i.weight === '500g' ? '500g' : '1kg';
    text += `  • ${i.name} (${w}) × ${i.quantity}\n`;
  });

  text += `\n*Total Paid:* ₹${total}\n`;

  if (status === 'Delivered') {
    text += `\nThank you for choosing Dhakshitha Pickles! 🙏\nWe hope you enjoy the authentic taste. ❤️\n\nPlease leave us a review — it means a lot!`;
  } else if (status === 'Cancelled') {
    text += `\nFor any queries, contact us:\n📞 +91 70138 98687`;
  } else {
    text += `\n🔍 Track your order:\nhttps://dakshitha-pickles.vercel.app/track\n\nTracking ID: *${tId}*`;
  }

  return text;
}

// Send via Meta Cloud API
async function sendMetaMessage(toPhone, text) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`;

  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: text
    }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WA_TOKEN}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    // Meta error codes reference:
    // 131047 = customer hasn't messaged business in 24h (need template)
    // 131026 = number doesn't exist on WhatsApp
    // 131000 = general send error
    const code    = data?.error?.code;
    const subcode = data?.error?.error_subcode;
    const msg     = data?.error?.message || JSON.stringify(data);

    if (code === 131047 || subcode === 131047) {
      throw new Error(`OUTSIDE_24H_WINDOW: Customer needs to message your WhatsApp number first, or use a template message. (${msg})`);
    }
    if (code === 131026) {
      throw new Error(`NOT_ON_WHATSAPP: The number ${toPhone} is not registered on WhatsApp. (${msg})`);
    }
    throw new Error(`META_API_ERROR [${code}]: ${msg}`);
  }

  return data;
}

// ── Main export — called by orders route ─────────────────────
async function sendOrderStatusMessage(order) {
  // Check if customer opted in
  if (!order.wantsWhatsappUpdates) {
    return { skipped: true, reason: 'Customer opted out of WhatsApp updates' };
  }

  // Check credentials exist
  if (!PHONE_ID || !WA_TOKEN) {
    console.error('[WhatsApp] ❌ Missing WHATSAPP_PHONE_ID or WHATSAPP_TOKEN in environment');
    return { failed: true, error: 'WhatsApp credentials missing in environment variables' };
  }

  const rawPhone = order.billingDetails?.phone;
  if (!rawPhone) {
    return { failed: true, error: 'No phone number on this order' };
  }

  try {
    const phone = formatPhone(rawPhone);
    console.log(`[WhatsApp] Sending "${order.status}" update to ${phone}...`);
    
    const text = buildMessage(order);
    const result = await sendMetaMessage(phone, text);
    
    console.log(`[WhatsApp] ✅ Message sent to ${phone} — ID: ${result?.messages?.[0]?.id}`);
    return { sent: true, messageId: result?.messages?.[0]?.id };

  } catch (err) {
    console.error(`[WhatsApp] ❌ Failed to send to ${rawPhone}:`, err.message);
    return { failed: true, error: err.message };
  }
}

// Stubs — WhatsApp login is disabled, secret key login is used
function isClientReady()         { return false; }
async function generatePairingCode() { return { error: 'WhatsApp login disabled. Use secret key.' }; }
async function sendLoginLink()       { throw new Error('WhatsApp login disabled.'); }

module.exports = {
  isClientReady,
  generatePairingCode,
  sendLoginLink,
  sendOrderStatusMessage,
  buildMessageText: buildMessage,  // exported so admin can build wa.me links
};

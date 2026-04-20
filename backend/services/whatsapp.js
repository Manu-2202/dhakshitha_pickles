/**
 * WhatsApp notifications via Meta Business Cloud API
 * Credentials: WHATSAPP_TOKEN + WHATSAPP_PHONE_ID in .env
 * No QR code, no Puppeteer, no persistent connection — just HTTP calls.
 */

const PHONE_ID    = process.env.WHATSAPP_PHONE_ID;
const WA_TOKEN    = process.env.WHATSAPP_TOKEN;
const API_URL     = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`;

// Format Indian phone → E.164 (91XXXXXXXXXX)
function formatPhone(raw) {
  let clean = raw.replace(/\D/g, '');
  if (clean.startsWith('0'))  clean = clean.slice(1);
  if (clean.length === 10)    clean = '91' + clean;
  return clean;
}

// Build the WhatsApp message text for each status
function buildMessage(order) {
  const { trackingId, _id, billingDetails, items, total, status } = order;
  const tId = trackingId || `DP-${String(_id).slice(-4).toUpperCase()}`;

  let header = '';
  switch (status) {
    case 'Packed':               header = `📦 *Your Order is Packed!*`; break;
    case 'Waiting for Transport':header = `🚚 *Awaiting Pickup!*`; break;
    case 'Out for Delivery':     header = `🛵 *Out for Delivery!*`; break;
    case 'Delivered':            header = `✅ *Delivered Successfully!*`; break;
    case 'Cancelled':            header = `❌ *Order Cancelled*`; break;
    default:                     header = `📄 *Order Status Update*`;
  }

  let text = `${header}\n\nHi ${billingDetails?.firstName || 'Customer'},\nYour order *${tId}* status is now: *${status}*.\n\n*Items:*`;
  items.forEach(i => {
    const w = i.weight === '250g' ? '(250g)' : i.weight === '500g' ? '(500g)' : '(1kg)';
    text += `\n▫️ ${i.name} ${w} x${i.quantity}`;
  });
  text += `\n\n*Total:* ₹${total}`;
  if (status === 'Delivered') {
    text += `\n\nThank you for choosing Dhakshitha Pickles! Enjoy the authentic taste. ❤️`;
  } else {
    text += `\n\nTrack your order anytime:\nhttps://dakshitha-pickles.vercel.app/track`;
  }
  return text;
}

// Send a WhatsApp text message via Meta Cloud API
async function sendMetaMessage(toPhone, text) {
  const body = {
    messaging_product: 'whatsapp',
    to: toPhone,
    type: 'text',
    text: { body: text, preview_url: false }
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WA_TOKEN}`,
      'Content-Type':  'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || JSON.stringify(data));
  return data;
}

// Called by orders route when admin updates status
async function sendOrderStatusMessage(order) {
  if (!order.wantsWhatsappUpdates)  return { skipped: true, reason: 'Customer opted out' };
  if (!PHONE_ID || !WA_TOKEN)       return { failed: true,  error: 'WhatsApp credentials missing in env' };

  const rawPhone = order.billingDetails?.phone;
  if (!rawPhone) return { failed: true, error: 'No customer phone on order' };

  try {
    const phone = formatPhone(rawPhone);
    const text  = buildMessage(order);
    await sendMetaMessage(phone, text);
    console.log(`[WhatsApp] ✅ Sent "${order.status}" update to ${rawPhone}`);
    return { sent: true };
  } catch (err) {
    console.error(`[WhatsApp] ❌ Failed:`, err.message);
    return { failed: true, error: err.message };
  }
}

// Stub — admin WhatsApp login via Meta is not needed; secret-key login is used instead
function isClientReady() { return false; }
async function generatePairingCode() { return { error: 'WhatsApp login is disabled. Use secret key login.' }; }
async function sendLoginLink()       { throw new Error('WhatsApp login is disabled.'); }

module.exports = {
  isClientReady,
  generatePairingCode,
  sendLoginLink,
  sendOrderStatusMessage
};

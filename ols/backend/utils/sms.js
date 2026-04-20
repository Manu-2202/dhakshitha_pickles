const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

let isClientReady = false;
let messageQueue = []; // Holds messages to send once ready

// ... [existing config]
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : undefined,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
    console.log('\n======================================================');
    console.log('[WhatsApp] Scan the QR code above with your WhatsApp app!');
    console.log('======================================================\n');
});

// Helper to actually send message
const executeSend = async (phone, message) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    const chatId = cleanPhone + "@c.us";
    
    let retryCount = 0;
    let success = false;
    
    while (retryCount < 3 && !success) {
        try {
            await client.sendMessage(chatId, message);
            success = true;
            console.log(`[WhatsApp SUCCESS] Sent automatically to ${cleanPhone}`);
        } catch (err) {
            retryCount++;
            await new Promise(r => setTimeout(r, 1500));
        }
    }
    if (!success) console.error('[WhatsApp ERROR] Failed completely after retries.');
    return success;
};

client.on('ready', async () => {
    console.log('[WhatsApp] ✅ Client connected! Free lifetime WhatsApp messaging is active.');
    isClientReady = true;

    // Flush any pending queued messages
    if (messageQueue.length > 0) {
        console.log(`[WhatsApp] Flushing ${messageQueue.length} queued messages...`);
        for (const item of messageQueue) {
            await executeSend(item.phone, item.message);
        }
        messageQueue = [];
    }
});

client.on('auth_failure', msg => {
    console.error('[WhatsApp] ❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
    console.log('[WhatsApp] Client was logged out or disconnected:', reason);
    isClientReady = false;
    setTimeout(() => {
        console.log('[WhatsApp] Attempting to reconnect...');
        client.initialize().catch(e => console.error('[WhatsApp Re-Init Error]:', e.message));
    }, 5000);
});

client.initialize().catch(err => {
    console.error('[WhatsApp INITIALIZATION ERROR]:', err.message);
});

const sendSMSNotify = async (phone, message) => {
    try {
        if (!isClientReady) {
            console.log(`[WhatsApp QUEUED] Client warming up. Queuing msg for ${phone}...`);
            messageQueue.push({ phone, message });
            return true;
        }
        
        return await executeSend(phone, message);
    } catch (error) {
        console.error('[WhatsApp ERROR] Fatal Error:', error.message);
        return false;
    }
};

module.exports = { sendSMSNotify };

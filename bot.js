const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require('@whiskeysockets/baileys');
require('dotenv').config();
const pino = require('pino');
const cron = require('node-cron');
const qrcode = require('qrcode-terminal');
const sqlite3 = require('sqlite3').verbose();

const GROUP_ID_TARGET = process.env.GROUP_ID;

if (!GROUP_ID_TARGET) {
    console.error("Error: GROUP_ID tidak ditemukan di file .env. Silakan buat file .env dan isi dengan GROUP_ID='idgrupanda@g.us'");
    process.exit(1);
}


const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Gagal membuka database', err.message);
    } else {
        console.log('Berhasil terhubung ke database lokal (SQLite).');
        db.run('CREATE TABLE IF NOT EXISTS pengeluaran (id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT, hari TEXT, keterangan TEXT, jumlah INTEGER)');
    }
});

function insertExpense(data) {
    return new Promise((resolve, reject) => {
        const { Tanggal, Hari, Keterangan, Jumlah } = data;
        db.run('INSERT INTO pengeluaran (tanggal, hari, keterangan, jumlah) VALUES (?, ?, ?, ?)', [Tanggal, Hari, Keterangan, Jumlah], function(err) {
            if (err) {
                console.error('Gagal menyimpan ke database', err.message);
                reject(err);
            } else {
                console.log(`Data berhasil disimpan dengan ID: ${this.lastID}`);
                resolve();
            }
        });
    });
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
    });

    cron.schedule('30 20 * * *', () => {
        console.log('Mengirim pesan pengingat pengeluaran...');
        sock.sendMessage(GROUP_ID_TARGET, {
            text: '🔔 Pengingat Harian 🔔\n\nJangan lupa catat pengeluaranmu hari ini ya!\n\nKirim dengan format:\nhari ini\n(keterangan)\n(jumlah)'
        });
    }, {
        scheduled: true,
        timezone: "Asia/Jakarta"
    });
    console.log('Pesan pengingat harian telah dijadwalkan pada jam 20:30 WIB.');

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('QR Code diterima, silakan scan:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus karena ', lastDisconnect.error, ', mencoba menghubungkan kembali... ', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            console.log('Bot berhasil terhubung!');
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msgInfo = m.messages[0];
        if (!msgInfo.message) return;

        const sender = msgInfo.key.remoteJid;
        
        if (sender !== GROUP_ID_TARGET || msgInfo.key.fromMe) {
            return;
        }

        const messageType = Object.keys(msgInfo.message)[0];
        if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
            const textMessage = msgInfo.message.conversation || msgInfo.message.extendedTextMessage.text;

            const parts = textMessage.trim().split('\n');

            if (parts.length === 3 && parts[0].toLowerCase() === 'hari ini') {
                const keterangan = parts[1].trim();
                const jumlahStr = parts[2].trim().replace(/[^0-9]/g, '');
                const jumlah = parseInt(jumlahStr, 10);

                if (keterangan && !isNaN(jumlah)) {
                    try {
                        const now = new Date();
                        const tanggal = now.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
                        const hari = now.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' });
                        
                        const dataToSave = {
                            Tanggal: tanggal,
                            Hari: hari,
                            Keterangan: keterangan,
                            Jumlah: jumlah,
                        };

                        await insertExpense(dataToSave);
                        
                        await sock.sendMessage(sender, {
                            text: `✅ Berhasil dicatat!\n\nTanggal: ${tanggal}\nHari: ${hari}\nKeterangan: ${keterangan}\nJumlah: Rp ${jumlah.toLocaleString('id-ID')}`
                        });

                    } catch (error) {
                        await sock.sendMessage(sender, { text: 'Maaf, terjadi kesalahan saat mencoba menyimpan data ke database.' });
                    }
                } else {
                    await sock.sendMessage(sender, { text: 'Formatnya salah nih. Coba lagi ya.\n\nContoh:\nhari ini\nBeli kopi\n25000' });
                }
            }
        }
    });
}



connectToWhatsApp();
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Путь к базе данных (создаётся в папке database)
const dbPath = path.join(__dirname, '../../database/housing.db');
if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath));
}

const db = new Database(dbPath);

// Создание таблиц (если не существуют)
db.exec(`
CREATE TABLE IF NOT EXISTS abonents (
    id TEXT PRIMARY KEY,
    fullName TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    numberOfPeople INTEGER,
    buildingType TEXT,
    waterTariff TEXT,
    status TEXT,
    balance REAL,
    createdAt TEXT
);

CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    abonentId TEXT,
    amount REAL,
    date TEXT,
    method TEXT,
    comment TEXT,
    FOREIGN KEY (abonentId) REFERENCES abonents(id)
);

CREATE TABLE IF NOT EXISTS meter_readings (
    id TEXT PRIMARY KEY,
    abonentId TEXT,
    date TEXT,
    value REAL,
    isAbnormal INTEGER,
    FOREIGN KEY (abonentId) REFERENCES abonents(id)
);
`);

// Пример функций
module.exports = {
    db,
    addAbonent: (abonent) => {
        const stmt = db.prepare(`INSERT INTO abonents (id, fullName, address, phone, numberOfPeople, buildingType, waterTariff, status, balance, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run(abonent.id, abonent.fullName, abonent.address, abonent.phone, abonent.numberOfPeople, abonent.buildingType, abonent.waterTariff, abonent.status, abonent.balance, abonent.createdAt);
    },
    getAbonents: () => {
        return db.prepare('SELECT * FROM abonents').all();
    },
    addPayment: (payment) => {
        const stmt = db.prepare(`INSERT INTO payments (id, abonentId, amount, date, method, comment) VALUES (?, ?, ?, ?, ?, ?)`);
        stmt.run(payment.id, payment.abonentId, payment.amount, payment.date, payment.method, payment.comment);
    },
    getPayments: () => {
        return db.prepare('SELECT * FROM payments').all();
    },
    addMeterReading: (reading) => {
        const stmt = db.prepare(`INSERT INTO meter_readings (id, abonentId, date, value, isAbnormal) VALUES (?, ?, ?, ?, ?)`);
        stmt.run(reading.id, reading.abonentId, reading.date, reading.value, reading.isAbnormal ? 1 : 0);
    },
    getMeterReadings: (abonentId) => {
        return db.prepare('SELECT * FROM meter_readings WHERE abonentId = ?').all(abonentId);
    }
}; 
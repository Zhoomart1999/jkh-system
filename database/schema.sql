-- Создание таблиц для системы ЖКХ

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'engineer', 'accountant', 'collector')),
    pin VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица абонентов
CREATE TABLE IF NOT EXISTS abonents (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    number_of_people INTEGER DEFAULT 1,
    building_type VARCHAR(50) DEFAULT 'apartment',
    water_tariff DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица платежей
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    abonent_id INTEGER REFERENCES abonents(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50) DEFAULT 'cash',
    payment_method VARCHAR(50) DEFAULT 'manual',
    collector_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тарифов
CREATE TABLE IF NOT EXISTS tariffs (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    effective_date DATE NOT NULL,
    water_by_meter DECIMAL(10,2) DEFAULT 0.00,
    water_by_person DECIMAL(10,2) DEFAULT 0.00,
    garbage_private DECIMAL(10,2) DEFAULT 0.00,
    garbage_apartment DECIMAL(10,2) DEFAULT 0.00,
    sales_tax_percent DECIMAL(5,2) DEFAULT 0.00,
    penalty_rate_percent DECIMAL(5,2) DEFAULT 0.00,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых данных
INSERT INTO users (name, role, pin, is_active) VALUES 
('Администратор', 'admin', '1234', true),
('Инженер', 'engineer', '5678', true),
('Бухгалтер', 'accountant', '9012', true),
('Контролёр', 'collector', '3456', true)
ON CONFLICT DO NOTHING;

INSERT INTO abonents (full_name, address, phone, number_of_people, building_type, water_tariff, status, balance) VALUES 
('Иванов Иван Иванович', 'ул. Ленина, 1, кв. 1', '+996700123456', 3, 'apartment', 15.50, 'active', 0.00),
('Петров Петр Петрович', 'ул. Советская, 5, кв. 10', '+996700654321', 2, 'apartment', 12.00, 'active', 150.00),
('Сидоров Сидор Сидорович', 'ул. Мира, 15, дом 2', '+996700111222', 4, 'private', 20.00, 'active', 0.00)
ON CONFLICT DO NOTHING;

INSERT INTO tariffs (version, effective_date, water_by_meter, water_by_person, garbage_private, garbage_apartment, sales_tax_percent, penalty_rate_percent, created_by, is_active, description) VALUES 
('2024.01', '2024-01-01', 12.50, 8.00, 25.00, 15.00, 12.00, 0.50, 1, true, 'Тарифы на 2024 год')
ON CONFLICT DO NOTHING; 
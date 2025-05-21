<?php
$db = new SQLite3(__DIR__ . '/reviews.sqlite');

// Создаем таблицу для отзывов
$db->exec("CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    telegram_id TEXT,
    telegram_username TEXT,
    rating INTEGER NOT NULL,
    review TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

// Создаем таблицу для сессий
$db->exec("CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT NOT NULL,
    telegram_username TEXT,
    session_token TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
)");

echo "✅ Таблицы 'reviews' и 'sessions' созданы";

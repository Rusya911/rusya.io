<?php
$db = new SQLite3(__DIR__ . '/db/reviews.sqlite');
$db->exec("CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact TEXT NOT NULL UNIQUE,
  rating INTEGER NOT NULL,
  review TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");
echo "✅ Таблица 'reviews' создана";

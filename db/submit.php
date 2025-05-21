<?php
header('Content-Type: application/json');
session_start();

// Функция для проверки авторизации
function checkAuth() {
    if (!isset($_SESSION['telegram_id'])) {
        return false;
    }
    
    $db = new SQLite3(__DIR__ . '/reviews.sqlite');
    $stmt = $db->prepare("SELECT * FROM sessions WHERE telegram_id = :telegram_id AND expires_at > datetime('now')");
    $stmt->bindValue(':telegram_id', $_SESSION['telegram_id'], SQLITE3_TEXT);
    $result = $stmt->execute();
    
    return $result->fetchArray() !== false;
}

// Функция для создания сессии
function createSession($telegram_id, $telegram_username) {
    $db = new SQLite3(__DIR__ . '/reviews.sqlite');
    $session_token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+30 days'));
    
    $stmt = $db->prepare("INSERT INTO sessions (telegram_id, telegram_username, session_token, expires_at) 
                         VALUES (:telegram_id, :telegram_username, :session_token, :expires_at)");
    $stmt->bindValue(':telegram_id', $telegram_id, SQLITE3_TEXT);
    $stmt->bindValue(':telegram_username', $telegram_username, SQLITE3_TEXT);
    $stmt->bindValue(':session_token', $session_token, SQLITE3_TEXT);
    $stmt->bindValue(':expires_at', $expires_at, SQLITE3_TEXT);
    $stmt->execute();
    
    $_SESSION['telegram_id'] = $telegram_id;
    $_SESSION['telegram_username'] = $telegram_username;
    $_SESSION['session_token'] = $session_token;
    
    return $session_token;
}

$data = json_decode(file_get_contents("php://input"), true);

// Обработка авторизации через Telegram
if (isset($data['auth'])) {
    $telegram_id = trim($data['telegram_id']);
    $telegram_username = trim($data['telegram_username']);
    
    if (!$telegram_id) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Неверные данные для авторизации"]);
        exit;
    }
    
    $session_token = createSession($telegram_id, $telegram_username);
    echo json_encode([
        "status" => "success", 
        "message" => "Авторизация успешна",
        "session_token" => $session_token
    ]);
    exit;
}

// Проверка авторизации для остальных операций
if (!checkAuth()) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Требуется авторизация"]);
    exit;
}

// Обработка отзыва
if (isset($data['review'])) {
    $name = trim($data['name']);
    $rating = (int)$data['rating'];
    $review = trim($data['review']);
    $review_id = isset($data['review_id']) ? (int)$data['review_id'] : null;
    
    if (!$name || !$review || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Неверные данные отзыва"]);
        exit;
    }
    
    $db = new SQLite3(__DIR__ . '/reviews.sqlite');
    
    if ($review_id) {
        // Обновление существующего отзыва
        $stmt = $db->prepare("UPDATE reviews 
                             SET name = :name, rating = :rating, review = :review, updated_at = CURRENT_TIMESTAMP 
                             WHERE id = :id AND telegram_id = :telegram_id");
        $stmt->bindValue(':id', $review_id);
        $stmt->bindValue(':telegram_id', $_SESSION['telegram_id']);
    } else {
        // Создание нового отзыва
        $stmt = $db->prepare("INSERT INTO reviews (name, telegram_id, telegram_username, rating, review) 
                             VALUES (:name, :telegram_id, :telegram_username, :rating, :review)");
        $stmt->bindValue(':telegram_id', $_SESSION['telegram_id']);
        $stmt->bindValue(':telegram_username', $_SESSION['telegram_username']);
    }
    
    $stmt->bindValue(':name', $name);
    $stmt->bindValue(':rating', $rating);
    $stmt->bindValue(':review', $review);
    $stmt->execute();
    
    echo json_encode([
        "status" => "success", 
        "message" => $review_id ? "Отзыв обновлен!" : "Отзыв сохранен!"
    ]);
    exit;
}

// Получение списка отзывов пользователя
if (isset($data['get_my_reviews'])) {
    $db = new SQLite3(__DIR__ . '/reviews.sqlite');
    $stmt = $db->prepare("SELECT * FROM reviews WHERE telegram_id = :telegram_id ORDER BY created_at DESC");
    $stmt->bindValue(':telegram_id', $_SESSION['telegram_id']);
    $result = $stmt->execute();
    
    $reviews = [];
    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $reviews[] = $row;
    }
    
    echo json_encode([
        "status" => "success",
        "reviews" => $reviews
    ]);
    exit;
}

// Удаление отзыва
if (isset($data['delete_review'])) {
    $review_id = (int)$data['review_id'];
    
    $db = new SQLite3(__DIR__ . '/reviews.sqlite');
    $stmt = $db->prepare("DELETE FROM reviews WHERE id = :id AND telegram_id = :telegram_id");
    $stmt->bindValue(':id', $review_id);
    $stmt->bindValue(':telegram_id', $_SESSION['telegram_id']);
    $stmt->execute();
    
    echo json_encode([
        "status" => "success",
        "message" => "Отзыв удален"
    ]);
    exit;
}

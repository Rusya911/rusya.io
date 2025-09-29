<?php
header('Content-Type: application/json');

// Restrict CORS to site origin
$allowed_origin = 'https://my-pc-master.online';
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowed_origin) {
    header('Access-Control-Allow-Origin: ' . $allowed_origin);
} else {
    // For simple GET without Origin (direct browser visit), do not set wildcard
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Путь к базе данных
$db_path = __DIR__ . '/../db/reviews.db';

try {
    // Подключение к базе данных
    $db = new SQLite3($db_path);
    
    // Обработка GET запроса для получения отзывов
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $query = "SELECT * FROM reviews ORDER BY created_at DESC";
        $result = $db->query($query);
        
        $reviews = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $reviews[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'rating' => $row['rating'],
                'review_text' => $row['review_text'],
                'created_at' => $row['created_at']
            ];
        }
        
        echo json_encode(['success' => true, 'reviews' => $reviews]);
    }
    
    // Обработка POST запроса для добавления отзыва
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            throw new Exception('Invalid JSON data');
        }
        
        // Валидация данных
        if (empty($data['name']) || strlen($data['name']) < 2) {
            throw new Exception('Name must be at least 2 characters long');
        }
        
        if (!isset($data['rating']) || $data['rating'] < 1 || $data['rating'] > 5) {
            throw new Exception('Rating must be between 1 and 5');
        }
        
        if (empty($data['review_text']) || strlen($data['review_text']) < 10) {
            throw new Exception('Review must be at least 10 characters long');
        }
        
        // Подготовка и выполнение запроса
        $stmt = $db->prepare('INSERT INTO reviews (name, rating, review_text, ip_address, user_agent) VALUES (:name, :rating, :review_text, :ip_address, :user_agent)');
        
        $stmt->bindValue(':name', $data['name'], SQLITE3_TEXT);
        $stmt->bindValue(':rating', $data['rating'], SQLITE3_INTEGER);
        $stmt->bindValue(':review_text', $data['review_text'], SQLITE3_TEXT);
        $stmt->bindValue(':ip_address', $_SERVER['REMOTE_ADDR'], SQLITE3_TEXT);
        $stmt->bindValue(':user_agent', $_SERVER['HTTP_USER_AGENT'], SQLITE3_TEXT);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Review added successfully',
                'review_id' => $db->lastInsertRowID()
            ]);
        } else {
            throw new Exception('Failed to add review');
        }
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($db)) {
        $db->close();
    }
} 
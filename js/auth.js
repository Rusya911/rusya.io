// Функция для авторизации через Telegram
async function authWithTelegram() {
    try {
        // Проверяем, есть ли уже авторизация
        const response = await fetch('db/submit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                get_my_reviews: true
            })
        });
        
        if (response.ok) {
            return true; // Уже авторизован
        }
        
        // Если нет авторизации, показываем кнопку Telegram
        const telegramButton = document.createElement('a');
        telegramButton.href = 'https://t.me/Roo7ya';
        telegramButton.className = 'telegram-auth-button';
        telegramButton.innerHTML = '<i class="fab fa-telegram"></i> Авторизоваться через Telegram';
        telegramButton.target = '_blank';
        
        const authContainer = document.createElement('div');
        authContainer.className = 'auth-container';
        authContainer.appendChild(telegramButton);
        
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.parentNode.insertBefore(authContainer, reviewForm);
            reviewForm.style.display = 'none';
        }
        
        // Слушаем сообщения от Telegram WebApp
        window.addEventListener('message', async function(event) {
            if (event.data.type === 'telegram_auth') {
                const authResponse = await fetch('db/submit.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        auth: true,
                        telegram_id: event.data.telegram_id,
                        telegram_username: event.data.telegram_username
                    })
                });
                
                if (authResponse.ok) {
                    authContainer.remove();
                    if (reviewForm) {
                        reviewForm.style.display = 'block';
                    }
                    return true;
                }
            }
        });
        
        return false;
    } catch (error) {
        console.error('Auth error:', error);
        return false;
    }
}

// Функция для получения отзывов пользователя
async function getMyReviews() {
    try {
        const response = await fetch('db/submit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                get_my_reviews: true
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.reviews;
        }
        return [];
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}

// Функция для удаления отзыва
async function deleteReview(reviewId) {
    try {
        const response = await fetch('db/submit.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                delete_review: true,
                review_id: reviewId
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.status === 'success') {
                const reviewElement = document.querySelector(`[data-review-id="${reviewId}"]`);
                if (reviewElement) {
                    reviewElement.remove();
                }
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error deleting review:', error);
        return false;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    const isAuthorized = await authWithTelegram();
    
    if (isAuthorized) {
        const reviews = await getMyReviews();
        // Добавляем кнопки редактирования и удаления к отзывам пользователя
        reviews.forEach(review => {
            const reviewElement = document.querySelector(`[data-review-id="${review.id}"]`);
            if (reviewElement) {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'review-actions';
                
                const editButton = document.createElement('button');
                editButton.className = 'edit-review-btn';
                editButton.innerHTML = '<i class="fas fa-edit"></i>';
                editButton.onclick = () => editReview(review);
                
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-review-btn';
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.onclick = () => deleteReview(review.id);
                
                actionsDiv.appendChild(editButton);
                actionsDiv.appendChild(deleteButton);
                reviewElement.appendChild(actionsDiv);
            }
        });
    }
}); 
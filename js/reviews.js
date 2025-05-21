// Генерация случайного числа для капчи
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 9) + 1; // От 1 до 9
    const num2 = Math.floor(Math.random() * 9) + 1; // От 1 до 9
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch(operator) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            // Убеждаемся, что из большего вычитаем меньшее
            if (num1 >= num2) {
                answer = num1 - num2;
            } else {
                answer = num2 - num1;
                document.getElementById('captchaQuestion').textContent = `${num2} ${operator} ${num1} = ?`;
                return answer;
            }
            break;
        case '*':
            answer = num1 * num2;
            break;
    }
    
    document.getElementById('captchaQuestion').textContent = `${num1} ${operator} ${num2} = ?`;
    return answer;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    try {
        const reviewForm = document.getElementById('reviewForm');
        const captchaQuestion = document.getElementById('captchaQuestion');
        
        if (!reviewForm || !captchaQuestion) {
            console.error('Required form elements not found');
            return;
        }
        
        let currentCaptchaAnswer = generateCaptcha();
        
        // Предотвращаем отправку формы при нажатии Enter
        reviewForm.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
        
        // Обработка отправки формы
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const rating = document.querySelector('input[name="rating"]:checked');
            const review = document.getElementById('review').value.trim();
            const captchaInput = document.getElementById('captcha').value.trim();
            
            // Валидация формы
            if (!name || name.length < 2) {
                showMessage('Имя должно содержать минимум 2 символа', 'error');
                return;
            }
            
            if (!rating) {
                showMessage('Пожалуйста, выберите оценку', 'error');
                return;
            }
            
            if (!review || review.length < 10) {
                showMessage('Отзыв должен содержать минимум 10 символов', 'error');
                return;
            }
            
            if (!captchaInput) {
                showMessage('Пожалуйста, решите пример', 'error');
                return;
            }
            
            if (parseInt(captchaInput) !== currentCaptchaAnswer) {
                showMessage('Неверный ответ на пример', 'error');
                document.getElementById('captcha').value = '';
                currentCaptchaAnswer = generateCaptcha();
                return;
            }
            
            // Создание нового отзыва
            const reviewCard = createReviewCard(name, rating.value, review);
            const reviewsGrid = document.querySelector('.reviews-grid');
            
            if (reviewsGrid) {
                reviewsGrid.insertBefore(reviewCard, reviewsGrid.firstChild);
                
                // Плавная анимация появления нового отзыва
                reviewCard.style.opacity = '0';
                reviewCard.style.transform = 'translateY(-20px)';
                
                requestAnimationFrame(() => {
                    reviewCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    reviewCard.style.opacity = '1';
                    reviewCard.style.transform = 'translateY(0)';
                });
                
                // Очищаем форму и генерируем новую капчу
                this.reset();
                currentCaptchaAnswer = generateCaptcha();
                
                // Показываем сообщение об успехе
                showMessage('Отзыв успешно добавлен!', 'success');
                
                // Прокручиваем к новому отзыву
                reviewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        
        // Добавляем обработку тач-событий для рейтинга
        const ratingInputs = document.querySelectorAll('.rating-input input[type="radio"]');
        ratingInputs.forEach(input => {
            input.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.checked = true;
            }, { passive: false });
        });
        
    } catch (error) {
        console.error('Error in reviews.js:', error);
    }
});

// Функция для отображения сообщений
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    const formContainer = document.querySelector('.review-form-container');
    if (!formContainer) return;
    
    formContainer.insertBefore(messageDiv, formContainer.firstChild);
    
    // Анимация появления сообщения
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(-10px)';
    
    requestAnimationFrame(() => {
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    });
    
    // Удаляем сообщение через 5 секунд с анимацией
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 5000);
}

// Создание карточки отзыва
function createReviewCard(name, rating, text) {
    const article = document.createElement('article');
    article.className = 'review-card';
    
    const date = new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const stars = Array(5).fill().map((_, i) => 
        `<i class="fas fa-star${i < rating ? '' : '-half-alt'}"></i>`
    ).join('');
    
    article.innerHTML = `
        <div class="review-header">
            <div class="review-author">${name}</div>
            <div class="review-date">${date}</div>
        </div>
        <div class="review-rating">${stars}</div>
        <p class="review-text">${text}</p>
    `;
    
    return article;
} 
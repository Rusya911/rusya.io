// Генерация случайного числа для капчи
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch(operator) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            break;
        case '*':
            answer = num1 * num2;
            break;
    }
    
    document.getElementById('captchaQuestion').textContent = `${num1} ${operator} ${num2} = ?`;
    return answer;
}

// Инициализация капчи при загрузке страницы
let captchaAnswer;
document.addEventListener('DOMContentLoaded', () => {
    captchaAnswer = generateCaptcha();
    
    // Обработка отправки формы
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleSubmit);
    }
});

// Обработка отправки формы
function handleSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked');
    const review = document.getElementById('review').value.trim();
    const captchaInput = document.getElementById('captchaInput').value.trim();
    
    // Валидация формы
    if (!name) {
        showError('Пожалуйста, введите ваше имя');
        return;
    }
    
    if (!rating) {
        showError('Пожалуйста, выберите оценку');
        return;
    }
    
    if (!review) {
        showError('Пожалуйста, напишите отзыв');
        return;
    }
    
    if (!captchaInput) {
        showError('Пожалуйста, решите пример');
        return;
    }
    
    if (parseInt(captchaInput) !== captchaAnswer) {
        showError('Неверный ответ на пример');
        document.getElementById('captchaInput').value = '';
        captchaAnswer = generateCaptcha();
        return;
    }
    
    // Создание нового отзыва
    const newReview = createReviewCard(name, rating.value, review);
    
    // Добавление отзыва в начало списка
    const reviewsGrid = document.querySelector('.reviews-grid');
    if (reviewsGrid) {
        reviewsGrid.insertBefore(newReview, reviewsGrid.firstChild);
        
        // Очистка формы
        event.target.reset();
        captchaAnswer = generateCaptcha();
        
        // Показ сообщения об успехе
        showSuccess('Спасибо за ваш отзыв!');
    }
}

// Создание карточки отзыва
function createReviewCard(name, rating, text) {
    const article = document.createElement('article');
    article.className = 'review-card';
    
    const date = new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    
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

// Показ сообщения об ошибке
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('reviewForm');
    if (form) {
        form.insertBefore(errorDiv, form.firstChild);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}

// Показ сообщения об успехе
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.getElementById('reviewForm');
    if (form) {
        form.insertBefore(successDiv, form.firstChild);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
  try {
    const reviewForm = document.getElementById('reviewForm');
    const captchaQuestion = document.getElementById('captchaQuestion');
    
    // Генерация простой капчи
    function generateCaptcha() {
      const num1 = Math.floor(Math.random() * 10);
      const num2 = Math.floor(Math.random() * 10);
      const answer = num1 + num2;
      captchaQuestion.textContent = `${num1} + ${num2} = ?`;
      return answer;
    }
    
    let currentCaptchaAnswer = generateCaptcha();
    
    // Валидация формы
    function validateForm(formData) {
      const name = formData.get('name');
      const rating = formData.get('rating');
      const review = formData.get('review');
      const captcha = formData.get('captcha');
      
      if (!name || name.length < 2) {
        throw new Error('Имя должно содержать минимум 2 символа');
      }
      
      if (!rating) {
        throw new Error('Пожалуйста, выберите оценку');
      }
      
      if (!review || review.length < 10) {
        throw new Error('Отзыв должен содержать минимум 10 символов');
      }
      
      if (parseInt(captcha) !== currentCaptchaAnswer) {
        throw new Error('Неверный ответ на капчу');
      }
      
      return true;
    }
    
    // Обработка отправки формы
    if (reviewForm) {
      // Предотвращаем отправку формы при нажатии Enter
      reviewForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      });
      
      reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
          const formData = new FormData(this);
          
          if (validateForm(formData)) {
            // Здесь должна быть отправка данных на сервер
            // Пока просто добавляем отзыв на страницу
            const name = formData.get('name');
            const rating = parseInt(formData.get('rating'));
            const review = formData.get('review');
            
            const reviewCard = createReviewCard(name, rating, review);
            const reviewsGrid = document.querySelector('.reviews-grid');
            
            if (reviewsGrid) {
              reviewsGrid.insertBefore(reviewCard, reviewsGrid.firstChild);
              
              // Плавная анимация появления нового отзыва
              reviewCard.style.opacity = '0';
              reviewCard.style.transform = 'translateY(-20px)';
              
              setTimeout(() => {
                reviewCard.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                reviewCard.style.opacity = '1';
                reviewCard.style.transform = 'translateY(0)';
              }, 50);
            }
            
            // Очищаем форму и генерируем новую капчу
            this.reset();
            currentCaptchaAnswer = generateCaptcha();
            
            // Показываем сообщение об успехе
            showMessage('Отзыв успешно добавлен!', 'success');
            
            // Прокручиваем к новому отзыву
            if (reviewCard) {
              reviewCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        } catch (error) {
          showMessage(error.message, 'error');
        }
      });
    }
    
    // Функция для отображения сообщений
    function showMessage(message, type) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `${type}-message`;
      messageDiv.textContent = message;
      
      const formContainer = document.querySelector('.review-form-container');
      if (formContainer) {
        formContainer.insertBefore(messageDiv, formContainer.firstChild);
        
        // Анимация появления сообщения
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
          messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          messageDiv.style.opacity = '1';
          messageDiv.style.transform = 'translateY(0)';
        }, 50);
        
        // Удаляем сообщение через 5 секунд с анимацией
        setTimeout(() => {
          messageDiv.style.opacity = '0';
          messageDiv.style.transform = 'translateY(-10px)';
          
          setTimeout(() => {
            messageDiv.remove();
          }, 300);
        }, 5000);
      }
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
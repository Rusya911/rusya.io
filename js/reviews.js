// 🔧 ЗАМЕНИ на свои данные Supabase
const SUPABASE_URL = 'https://jfjaescqnacycsrfrbwj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmamFlc2NxbmFjeWNzcmZyYndqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MDkzNjQsImV4cCI6MjA2NDA4NTM2NH0.AhTOw9yjZxACvxMr3XdW2sC-Ek5AbijSkrLy-NKEOwE';

// Проверяем, что Supabase загружен
if (typeof window.supabase === 'undefined') {
  console.error('Supabase не загружен. Проверьте подключение скрипта Supabase.');
  showMessage('Ошибка подключения к базе данных. Пожалуйста, обновите страницу.', 'error');
} else {
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Тестовая функция для проверки подключения
  async function testConnection() {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Ошибка подключения:', error);
        showMessage('Ошибка подключения к базе данных: ' + error.message, 'error');
        return false;
      }
      
      console.log('Подключение успешно:', data);
      return true;
    } catch (err) {
      console.error('Ошибка при тестировании:', err);
      showMessage('Ошибка подключения к базе данных. Пожалуйста, обновите страницу.', 'error');
      return false;
    }
  }

  // 🧠 Простая капча: сумма двух случайных чисел
  let expectedCaptchaAnswer = 0;
  function generateCaptcha() {
    try {
      const captchaQuestion = document.getElementById('captchaQuestion');
      if (!captchaQuestion) {
        console.error('Элемент captchaQuestion не найден');
        return;
      }

      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      expectedCaptchaAnswer = a + b;
      
      captchaQuestion.textContent = `Сколько будет ${a} + ${b}?`;
      console.log('Капча сгенерирована:', expectedCaptchaAnswer);
    } catch (err) {
      console.error('Ошибка при генерации капчи:', err);
    }
  }

  // Форматирование номера телефона
  console.log('Инициализация обработки телефона...');

  function initPhoneInput() {
    console.log('Поиск элемента ввода телефона...');
    const phoneInput = document.getElementById('phoneInput');
    
    if (!phoneInput) {
      console.error('Элемент ввода телефона не найден');
      return;
    }
    
    console.log('Элемент ввода телефона найден:', phoneInput);

    // Обработка ввода
    phoneInput.addEventListener('input', function() {
      console.log('Событие input:', this.value);
      
      let numbers = this.value.replace(/\D/g, '');

      // Удаляем первую цифру, если пользователь ввёл 8 или 7 вручную
      if (numbers.startsWith('8') || numbers.startsWith('7')) {
        numbers = numbers.substring(1);
      }

      // Обрезаем до 10 цифр
      numbers = numbers.substring(0, 10);

      // Форматируем номер
      let formatted = '+7';

      if (numbers.length > 0) {
        formatted += ' (' + numbers.substring(0, 3);
      }
      if (numbers.length >= 4) {
        formatted += ') ' + numbers.substring(3, 6);
      }
      if (numbers.length >= 7) {
        formatted += '-' + numbers.substring(6, 8);
      }
      if (numbers.length >= 9) {
        formatted += '-' + numbers.substring(8, 10);
      }

      this.value = formatted;
    });

    // Блокируем ввод нецифровых символов
    phoneInput.addEventListener('keypress', function(e) {
      console.log('Событие keypress:', e.key);
      if (!/\d/.test(e.key)) {
        e.preventDefault();
      }
    });

    // Обработка вставки
    phoneInput.addEventListener('paste', function(e) {
      console.log('Событие paste');
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      console.log('Вставленный текст:', pastedText);
      this.value = pastedText;
      // Вызываем событие input для форматирования
      this.dispatchEvent(new Event('input'));
    });

    console.log('Обработчики событий для поля телефона добавлены');
  }

  // Инициализация при загрузке DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPhoneInput);
  } else {
    initPhoneInput();
  }

  // 📦 Отправка отзыва
  document.getElementById('reviewForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked')?.value;
    const review = document.getElementById('review').value.trim();
    const phone = document.getElementById('phoneInput').value.replace(/\D/g, ''); // Убираем все нецифровые символы
    const captcha = document.getElementById('captcha').value.trim();

    if (!rating) return alert('Пожалуйста, выберите оценку');
    if (phone.length !== 11) return alert('Введите корректный номер телефона');
    if (parseInt(captcha) !== expectedCaptchaAnswer) return alert('Неверный ответ на капчу');

    const { error } = await supabase
      .from('reviews')
      .insert([{ 
        name, 
        rating: parseInt(rating), 
        review, 
        phone: '+7' + phone.slice(1), // Сохраняем номер в формате +7XXXXXXXXXX
        created_at: new Date().toISOString()
      }]);

    if (error) {
      alert('Ошибка отправки отзыва: ' + error.message);
    } else {
      alert('Спасибо за отзыв!');
      this.reset();
      generateCaptcha(); // обновим капчу
      loadReviews(); // обновим список отзывов
    }
  });

  // 📋 Загрузка отзывов и отображение
  async function loadReviews() {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('id, name, rating, review, created_at')
        .order('created_at', { ascending: false });

      const reviewsGrid = document.querySelector('.reviews-grid');
      if (!reviewsGrid) {
        console.error('Элемент .reviews-grid не найден');
        return;
      }

      // Очищаем сетку отзывов
      reviewsGrid.innerHTML = '';

      if (error) {
        console.error('Ошибка загрузки:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Не удалось загрузить отзывы: ' + error.message;
        reviewsGrid.appendChild(errorDiv);
        return;
      }

      if (!reviews || reviews.length === 0) {
        const noReviewsDiv = document.createElement('div');
        noReviewsDiv.className = 'no-reviews';
        noReviewsDiv.textContent = 'Пока нет отзывов.';
        reviewsGrid.appendChild(noReviewsDiv);
      } else {
        reviews.forEach(({ name, rating, review, created_at }) => {
          const article = document.createElement('article');
          article.className = 'review-card';
          
          // Форматируем дату
          const date = new Date(created_at).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });

          // Создаем звезды рейтинга
          const stars = Array(5).fill().map((_, i) => 
            `<i class="fas fa-star${i < rating ? '' : '-half-alt'}"></i>`
          ).join('');

          article.innerHTML = `
            <div class="review-header">
              <div class="review-author">${name}</div>
              <div class="review-date">${date}</div>
            </div>
            <div class="review-rating">
              ${stars}
            </div>
            <p class="review-text">${review}</p>
          `;

          // Добавляем анимацию появления
          article.style.opacity = '0';
          article.style.transform = 'translateY(20px)';
          reviewsGrid.appendChild(article);

          // Запускаем анимацию
          requestAnimationFrame(() => {
            article.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            article.style.opacity = '1';
            article.style.transform = 'translateY(0)';
          });
        });
      }
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
    }
  }

  // 🟢 Старт
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM загружен, инициализация...');
    
    try {
      // Проверяем подключение при загрузке
      const isConnected = await testConnection();
      if (!isConnected) {
        console.error('Не удалось подключиться к базе данных');
        return;
      }
      
      // Генерируем первую капчу
      generateCaptcha();
      
      // Загружаем отзывы
      loadReviews();
    } catch (error) {
      console.error('Ошибка при инициализации:', error);
      showMessage('Произошла ошибка при загрузке страницы. Пожалуйста, обновите страницу.', 'error');
    }
  });

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
} 
// Phone number formatter for header
document.addEventListener('DOMContentLoaded', function() {
  try {
    const phoneEl = document.getElementById('phone');
    if (phoneEl) {
      phoneEl.innerHTML = '<i class="fas fa-phone" aria-hidden="true"></i> +7(978)059-70-99';
    }
    
    // Legacy code from the bottom of the page - can be removed if not needed
    const phoneHiddenEl = document.querySelector('.phone-hidden');
    if (phoneHiddenEl) {
      const phone = phoneHiddenEl.dataset.phone;
      phoneHiddenEl.innerHTML = '<i class="fas fa-phone"></i> +' + phone.substring(0, 1) +
        '(' + phone.substring(1, 4) + ')' +
        phone.substring(4, 7) + '-' + phone.substring(7, 9) + '-' + phone.substring(9, 11);
      phoneHiddenEl.style.direction = 'ltr';
    }
    
    // Создаём плавающую кнопку "Наверх"
    const body = document.body;
    if (body) {
      const floatingBtn = document.createElement('a');
      floatingBtn.className = 'floating-top-btn';
      floatingBtn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
      floatingBtn.href = '#top';
      floatingBtn.setAttribute('aria-label', 'Прокрутить наверх');
      body.appendChild(floatingBtn);
      
      // Оптимизация производительности скролла
      let scrollTimeout;
      let lastScrollTop = 0;
      let ticking = false;
      
      window.addEventListener('scroll', function() {
        if (!ticking) {
          window.requestAnimationFrame(function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Показываем/скрываем кнопку "Наверх"
            if (scrollTop > 300) {
              floatingBtn.style.opacity = '1';
              floatingBtn.style.visibility = 'visible';
            } else {
              floatingBtn.style.opacity = '0';
              floatingBtn.style.visibility = 'hidden';
            }
            
            // Предотвращаем скролл на iOS при открытой клавиатуре
            if (scrollTop === lastScrollTop) {
              document.body.style.overflow = 'hidden';
              setTimeout(() => {
                document.body.style.overflow = '';
              }, 100);
            }
            
            lastScrollTop = scrollTop;
            ticking = false;
          });
          
          ticking = true;
        }
      }, { passive: true });
    }
    
    // Плавный скролл для всех внутренних ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // Добавляем отступ для фиксированного меню
          const headerOffset = 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Обновляем URL без перезагрузки страницы
          history.pushState(null, null, targetId);
        }
      });
    });
    
    // Оптимизация для мобильных устройств
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      document.body.classList.add('mobile-device');
      
      // Предотвращаем двойной тап для зума
      document.addEventListener('touchend', function(e) {
        if (e.target.tagName === 'A') {
          e.preventDefault();
          e.target.click();
        }
      }, { passive: false });
      
      // Улучшаем отзывчивость тач-событий
      document.addEventListener('touchstart', function() {}, { passive: true });
    }
  } catch (error) {
    console.error('Error in script.js:', error);
  }
}); 
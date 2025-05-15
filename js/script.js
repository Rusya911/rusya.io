// Phone number formatter for header
document.addEventListener('DOMContentLoaded', function() {
  const phoneEl = document.getElementById('phone');
  if (phoneEl) {
    phoneEl.innerHTML = '<i class="fas fa-phone"></i> +7(978)059-70-99';
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
  const floatingBtn = document.createElement('a');
  floatingBtn.className = 'floating-top-btn';
  floatingBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  floatingBtn.href = '#top';
  floatingBtn.setAttribute('aria-label', 'Прокрутить наверх');
  body.appendChild(floatingBtn);
  
  // Скрываем кнопку "Наверх" вначале
  floatingBtn.style.opacity = '0';
  floatingBtn.style.visibility = 'hidden';
  
  // Показываем кнопку "Наверх" при прокрутке вниз
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 300) {
      floatingBtn.style.opacity = '1';
      floatingBtn.style.visibility = 'visible';
    } else {
      floatingBtn.style.opacity = '0';
      floatingBtn.style.visibility = 'hidden';
    }
  }, { passive: true });
  
  // Плавный скролл для всех внутренних ссылок
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return; // Пропускаем ссылки с href="#"
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Используем scrollIntoView для плавного скролла
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Обновляем URL без перезагрузки страницы
        history.pushState(null, null, targetId);
      }
    });
  });
  
  // Скролл на мобильных - предотвращаем momentum scrolling на iOS
  let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    // Добавляем класс для мобильных устройств
    document.body.classList.add('mobile-device');
    
    // Убираем дребезг при скролле
    let lastScrollTop = 0;
    let ticking = false;
    
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          // Здесь можно добавить логику зависящую от скролла
          // Например, скрывать/показывать элементы при скролле
          
          lastScrollTop = currentScrollTop;
          ticking = false;
        });
        
        ticking = true;
      }
    }, { passive: true }); // passive: true улучшает производительность скролла
  }
}); 
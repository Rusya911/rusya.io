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
}); 
document.addEventListener("DOMContentLoaded", () => {
  console.log("Main page script loaded");

  const heroBookBtn = document.getElementById("hero-book-btn");

  if (heroBookBtn) {
    heroBookBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Перевіряємо, чи юзер авторизований (через UserService з db.js)
      const currentUser = UserService.getCurrentUser();

      if (currentUser) {
        // ЯКЩО АВТОРИЗОВАНИЙ -> Йдемо на сторінку запису
        // Якщо Клієнт
        if (currentUser.role !== "employee") {
          window.location.href = "pages/booking.html";
        } else {
          // Якщо Працівник натиснув (рідкісний кейс, але обробимо)
          window.location.href = "pages/dashboard.html";
        }
      } else {
        // ЯКЩО НЕ АВТОРИЗОВАНИЙ -> Показуємо модальне вікно
        const authModal = new bootstrap.Modal(
          document.getElementById("authRequiredModal")
        );
        authModal.show();
      }
    });
  }
});

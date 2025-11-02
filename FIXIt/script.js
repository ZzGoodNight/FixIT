// Чекаємо, поки весь HTML-документ завантажиться
document.addEventListener("DOMContentLoaded", () => {
  // --- Side Menu Logic ---
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const menuOverlay = document.getElementById("menu-overlay");
  const closeMenuBtn = document.getElementById("close-menu-btn");

  function openSideMenu() {
    mobileMenu.classList.remove("translate-x-full");
    menuOverlay.classList.remove("hidden");
  }

  function closeSideMenu() {
    mobileMenu.classList.add("translate-x-full");
    menuOverlay.classList.add("hidden");
  }

  hamburgerBtn.addEventListener("click", openSideMenu);
  closeMenuBtn.addEventListener("click", closeSideMenu);
  menuOverlay.addEventListener("click", closeSideMenu);

  // --- Modal Logic ---
  const bookingModal = document.getElementById("booking-modal");
  const slotsModal = document.getElementById("slots-modal");

  const openBookingBtns = document.querySelectorAll(
    ".nav-btn-open-booking-modal"
  );
  const openSlotsBtns = document.querySelectorAll(".nav-btn-open-slots-modal");

  const closeBookingModalBtn = document.getElementById("close-booking-modal");
  const closeSlotsModalBtn = document.getElementById("close-slots-modal");

  function openModal(modal) {
    modal.classList.remove("hidden");
    closeSideMenu(); // Закриваємо меню, коли відкриваємо модалку
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
  }

  openBookingBtns.forEach((btn) =>
    btn.addEventListener("click", () => openModal(bookingModal))
  );
  openSlotsBtns.forEach((btn) =>
    btn.addEventListener("click", () => openModal(slotsModal))
  );

  closeBookingModalBtn.addEventListener("click", () =>
    closeModal(bookingModal)
  );
  closeSlotsModalBtn.addEventListener("click", () => closeModal(slotsModal));

  // Закриття модалки по кліку на фон
  bookingModal.addEventListener("click", (e) => {
    if (e.target === bookingModal) closeModal(bookingModal);
  });
  slotsModal.addEventListener("click", (e) => {
    if (e.target === slotsModal) closeModal(slotsModal);
  });

  // --- !!! ВІДНОВЛЕНА ЛОГІКА НАВІГАЦІЇ СТОРІНКАМИ !!! ---

  // Контейнери сторінок
  const mainPageContent = document.getElementById("main-page-content");
  const authContainer = document.getElementById("auth-container");

  // Всі елементи, які є "сторінками"
  const allPages = document.querySelectorAll(".page");

  // Кнопки
  const gotoLoginBtns = document.querySelectorAll(
    ".nav-btn-goto-login, #goto-login-btn"
  );
  const gotoRegisterBtn = document.getElementById("goto-register-btn");
  const gotoMainBtns = document.querySelectorAll(".nav-btn-goto-main");

  /**
   * Головна функція навігації.
   * Ховає всі сторінки та показує одну потрібну.
   * @param {string} pageIdToShow - ID сторінки для показу ('main-page-content', 'login-page', 'register-page')
   */
  function showPage(pageIdToShow) {
    // 1. Ховаємо всі сторінки (і головну, і сторінки входу/реєстрації)
    allPages.forEach((page) => {
      page.classList.remove("active-page");
    });

    // 2. Ховаємо головний контейнер сторінки і контейнер автентифікації
    mainPageContent.classList.remove("active-page"); // Головний контент
    authContainer.classList.add("hidden"); // Контейнер входу/реєстрації

    // 3. Вирішуємо, що показати
    if (pageIdToShow === "login-page" || pageIdToShow === "register-page") {
      // Якщо це сторінка входу або реєстрації
      authContainer.classList.remove("hidden"); // Показуємо контейнер
      document.getElementById(pageIdToShow).classList.add("active-page"); // І потрібну сторінку всередині
    } else if (pageIdToShow === "main-page-content") {
      // Якщо це головна сторінка
      mainPageContent.classList.add("active-page"); // Показуємо головний контент
    }
    // (Пізніше тут можна додати логіку для 'client-dashboard-page' і 'staff-dashboard-page')
  }

  // --- Слухачі подій для навігації ---

  // Перехід на сторінку Входу
  gotoLoginBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("login-page");
      closeSideMenu();
    });
  });

  // Перехід на сторінку Реєстрації
  gotoRegisterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showPage("register-page");
    closeSideMenu();
  });

  // Повернення на Головну сторінку
  gotoMainBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showPage("main-page-content");
      closeSideMenu();
    });
  });

  // --- Логіка форм (поки що симуляція) ---
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault(); // Забороняємо формі перезавантажувати сторінку
    console.log("Форма входу відправлена (симуляція)");
    // Пізніше тут буде код для переходу в кабінет:
    // showPage('client-dashboard-page');
  });

  document.getElementById("register-form").addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Форма реєстрації відправлена (симуляція)");
    // Пізніше тут буде код для переходу на сторінку входу:
    // showPage('login-page');
  });

  document.getElementById("booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("Форма запису відправлена (симуляція)");
    closeModal(bookingModal);
  });
});

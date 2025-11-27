// js/components/header.js

document.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.getElementById("header-container");
  if (!headerContainer) return;

  // --- 1. ОТРИМАННЯ КОРИСТУВАЧА (Безпечно) ---
  let currentUser = null;
  try {
    if (typeof UserService !== "undefined") {
      currentUser = UserService.getCurrentUser();
    } else {
      console.warn(
        "UserService не знайдено. Перевірте порядок підключення скриптів."
      );
    }
  } catch (error) {
    console.error("Помилка авторизації:", error);
  }

  // --- 2. НАЛАШТУВАННЯ ШЛЯХІВ (Routing) ---
  // Визначаємо, де ми знаходимось, щоб правильно прописати посилання
  const isPagesFolder = window.location.pathname.includes("/pages/");

  const linkHome = isPagesFolder ? "../index.html" : "index.html";
  const linkLogin = isPagesFolder ? "login.html" : "pages/login.html";
  const linkRegister = isPagesFolder ? "register.html" : "pages/register.html";
  const linkDashboard = isPagesFolder
    ? "dashboard.html"
    : "pages/dashboard.html";
  const linkBooking = isPagesFolder ? "booking.html" : "pages/booking.html"; // Нове посилання

  // --- 3. ФОРМУВАННЯ ВМІСТУ МЕНЮ ---
  let authButtonsHtml = "";
  let cabinetLinkHtml = "";

  if (currentUser) {
    // === КОРИСТУВАЧ АВТОРИЗОВАНИЙ ===

    // Розділяємо меню для Працівника та Клієнта
    if (currentUser.role === "employee") {
      // Меню ПРАЦІВНИКА
      cabinetLinkHtml = `
        <li class="nav-item">
            <a class="nav-link fw-bold text-warning" href="${linkDashboard}">
                <i class="fas fa-tools me-2"></i>Панель Працівника
            </a>
        </li>`;
    } else {
      // Меню КЛІЄНТА (Запис + Гараж)
      cabinetLinkHtml = `
        <li class="nav-item">
            <a class="nav-link fw-bold text-primary" href="${linkBooking}">
                <i class="fas fa-plus-circle me-1"></i>Записатись
            </a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="${linkDashboard}">
                <i class="fas fa-car me-1"></i>Мій Гараж
            </a>
        </li>`;
    }

    // Кнопка Виходу (Спільна)
    authButtonsHtml = `
        <div class="d-flex align-items-center gap-3">
            <span class="text-white small d-none d-lg-block">
                Вітаємо, ${
                  currentUser.name ? currentUser.name.split(" ")[0] : "User"
                }
            </span>
            <button id="logout-btn-nav" class="btn btn-outline-light btn-sm">
                <i class="fas fa-sign-out-alt me-2"></i>Вийти
            </button>
        </div>`;
  } else {
    // === ГІСТЬ (НЕ АВТОРИЗОВАНИЙ) ===
    authButtonsHtml = `
        <div class="d-flex flex-column flex-lg-row gap-2">
            <a href="${linkLogin}" class="btn btn-outline-light btn-sm">
                <i class="fas fa-sign-in-alt me-2"></i> Вхід
            </a>
            <a href="${linkRegister}" class="btn btn-primary btn-sm">
                Реєстрація
            </a>
        </div>`;
  }

  // --- 4. HTML ШАБЛОН ---
  const headerTemplate = `
    <nav class="navbar navbar-dark bg-dark fixed-top shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="${linkHome}">
                <i class="fas fa-wrench text-primary"></i> 
                <span>FixIt</span>
            </a>

            <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse mt-2" id="navbarNav">
                <ul class="navbar-nav ms-auto mb-3 mb-lg-0 align-items-lg-center">
                    <li class="nav-item"><a class="nav-link" href="${linkHome}">Головна</a></li>
                    <li class="nav-item"><a class="nav-link" href="${linkHome}#services">Послуги</a></li>
                    
                    ${cabinetLinkHtml}
                </ul>

                <hr class="text-white-50 d-lg-none">

                <div class="ms-lg-3">
                    ${authButtonsHtml}
                </div>
            </div>
        </div>
    </nav>
  `;

  // Вставка HTML в сторінку
  headerContainer.innerHTML = headerTemplate;

  // --- 5. ОБРОБНИКИ ПОДІЙ ---

  // Логіка Виходу
  const logoutBtn = document.getElementById("logout-btn-nav");
  if (logoutBtn && typeof UserService !== "undefined") {
    logoutBtn.addEventListener("click", () => {
      UserService.logout();
    });
  }

  // Автоматичне закриття меню на мобільному при кліку на посилання
  const navLinks = document.querySelectorAll(".nav-link, .btn");
  const navbarCollapse = document.getElementById("navbarNav");

  if (navLinks && navbarCollapse) {
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navbarCollapse.classList.contains("show")) {
          if (typeof bootstrap !== "undefined") {
            new bootstrap.Collapse(navbarCollapse, { toggle: true }).hide();
          }
        }
      });
    });
  }
});

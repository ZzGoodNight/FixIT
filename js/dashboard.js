// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Перевірка авторизації
  const currentUser = UserService.getCurrentUser();
  if (!currentUser) {
    window.location.href = "/pages/login.html";
    return;
  }

  // 2. Розподіл ролей
  if (currentUser.role === "employee") {
    document.getElementById("employee-panel").classList.remove("d-none");
    initEmployeeLogic();
  } else {
    document.getElementById("client-panel").classList.remove("d-none");
    initClientLogic(currentUser);
  }
});

// =========================================================
// 🚗 ЛОГІКА КЛІЄНТА (Тільки Гараж та Історія)
// =========================================================
function initClientLogic(user) {
  document.getElementById("client-name-display").textContent = user.name;
  const carsList = document.getElementById("cars-list");
  const ordersTable = document.getElementById("client-orders-table");

  // --- 1. Рендер списку машин ---
  function renderCars() {
    const cars = CarService.getByClientId(user.id);

    if (cars.length === 0) {
      carsList.innerHTML = `<p class="text-muted text-center py-3">Гараж порожній. Додайте авто.</p>`;
      return;
    }

    carsList.innerHTML = cars
      .map(
        (c) => `
            <div class="card p-3 shadow-sm mb-3 border-start border-4 border-primary position-relative">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong class="fs-5">${c.make} ${c.model}</strong>
                        <span class="badge bg-light text-dark border ms-2">${c.plate}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCar('${c.id}')" title="Видалити авто">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="small text-muted mt-2 font-monospace">VIN: ${c.vin}</div>
            </div>`
      )
      .join("");
  }

  // --- 2. Додавання нового авто ---
  document.getElementById("add-car-form").addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      CarService.add({
        clientId: user.id,
        make: document.getElementById("car-make").value,
        model: document.getElementById("car-model").value,
        plate: document.getElementById("car-plate").value.toUpperCase(),
        vin: document.getElementById("car-vin").value.toUpperCase(),
      });
      renderCars();
      e.target.reset();
      alert("Авто успішно додано!");
    } catch (error) {
      alert("Помилка при додаванні авто");
    }
  });

  // --- 3. Рендер історії замовлень ---
  function renderMyOrders() {
    const myOrders = OrderService.getAll().filter(
      (o) => o.clientId === user.id
    );

    if (myOrders.length === 0) {
      ordersTable.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Історія замовлень порожня</td></tr>`;
      return;
    }

    ordersTable.innerHTML = myOrders
      .map(
        (o) => `
            <tr>
                <td class="fw-bold">${o.carName}</td>
                <td>${o.service}</td>
                <td>${o.date} <span class="badge bg-light text-dark border">${
          o.time
        }</span></td>
                <td>${
                  o.totalPrice
                    ? o.totalPrice + " грн"
                    : '<span class="text-muted small">В процесі</span>'
                }</td>
                <td><span class="badge bg-${getStatusColor(o.status)}">${
          o.status
        }</span></td>
            </tr>
        `
      )
      .join("");
  }

  // Глобальна функція для видалення авто (щоб працювала через onclick)
  window.deleteCar = (carId) => {
    if (
      confirm(
        "Ви впевнені? Це також видалить історію замовлень для цього авто."
      )
    ) {
      CarService.delete(carId);
      renderCars();
    }
  };

  // Запуск
  renderCars();
  renderMyOrders();
}

// =========================================================
// 🛠️ ЛОГІКА ПРАЦІВНИКА (Склад + Замовлення)
// =========================================================
function initEmployeeLogic() {
  const warehouseTable = document.getElementById("warehouse-table");
  const ordersTable = document.getElementById("employee-orders-table");
  let currentEditingOrder = null;
  let tempPartsList = []; // Тимчасовий список запчастин для поточного модального вікна

  // --- 1. СКЛАД (Warehouse) ---
  function renderWarehouse() {
    const parts = PartService.getAll();
    warehouseTable.innerHTML = parts
      .map(
        (p) => `
            <tr>
                <td>${p.name}</td>
                <td><span class="badge bg-${
                  p.type === "original" ? "primary" : "secondary"
                }">${p.type === "original" ? "Оригінал" : "Репліка"}</span></td>
                <td>${p.price} грн</td>
                <td class="${p.quantity < 5 ? "text-danger fw-bold" : ""}">${
          p.quantity
        } шт.</td>
            </tr>
        `
      )
      .join("");

    // Оновлюємо також селект в модалці
    const modalSelect = document.getElementById("modal-part-select");
    if (modalSelect) {
      modalSelect.innerHTML = parts
        .map(
          (p) =>
            `<option value="${p.id}" data-price="${p.price}">${p.name} (${p.quantity} шт) - ${p.price} грн</option>`
        )
        .join("");
    }
  }

  // Додавання запчастини на склад
  const addPartForm = document.getElementById("add-part-form");
  if (addPartForm) {
    addPartForm.addEventListener("submit", (e) => {
      e.preventDefault();
      PartService.add({
        name: document.getElementById("part-name").value,
        type: document.getElementById("part-type").value,
        price: Number(document.getElementById("part-price").value),
        quantity: Number(document.getElementById("part-qty").value),
      });
      renderWarehouse();
      e.target.reset();
    });
  }

  // --- 2. ЗАМОВЛЕННЯ ---
  function renderOrders() {
    const orders = OrderService.getAll();
    ordersTable.innerHTML = orders
      .map(
        (o) => `
            <tr>
                <td><small class="text-muted font-monospace">#${o.id.slice(
                  -4
                )}</small></td>
                <td class="fw-bold">${o.carName}</td>
                <td>${o.service}</td>
                <td>${o.date} ${o.time}</td>
                <td><span class="badge bg-${getStatusColor(o.status)}">${
          o.status
        }</span></td>
                <td><button class="btn btn-sm btn-info text-white" onclick="openOrderModal('${
                  o.id
                }')">Деталі</button></td>
            </tr>
        `
      )
      .join("");
  }

  // --- 3. МОДАЛКА УПРАВЛІННЯ ЗАМОВЛЕННЯМ ---
  window.openOrderModal = (orderId) => {
    const order = OrderService.getAll().find((o) => o.id === orderId);
    if (!order) return;

    currentEditingOrder = order;
    tempPartsList = order.parts ? [...order.parts] : []; // Копіюємо існуючі запчастини

    // Заповнюємо поля
    document.getElementById("modal-car-name").textContent = order.carName;
    document.getElementById("modal-service").textContent = order.service;
    document.getElementById("modal-work-price").value = order.workPrice || 0;
    document.getElementById("modal-status").value = order.status;

    updateModalPartsList();

    new bootstrap.Modal(document.getElementById("manageOrderModal")).show();
  };

  // Додавання запчастини в список (візуально в модалці)
  document
    .getElementById("btn-add-part-to-order")
    .addEventListener("click", () => {
      const select = document.getElementById("modal-part-select");
      const partId = select.value;
      const partData = PartService.getAll().find((p) => p.id === partId);

      if (partData && partData.quantity > 0) {
        tempPartsList.push({
          id: partData.id,
          name: partData.name,
          price: partData.price,
        });
        updateModalPartsList();
      } else {
        alert("Цієї запчастини немає в наявності або вона не обрана!");
      }
    });

  function updateModalPartsList() {
    const list = document.getElementById("modal-parts-list");
    list.innerHTML = tempPartsList
      .map(
        (p, index) => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${p.name}
                <span>${p.price} грн <i class="fas fa-times text-danger ms-2" style="cursor:pointer" onclick="removeTempPart(${index})"></i></span>
            </li>
        `
      )
      .join("");

    // Рахуємо загальну суму
    const partsSum = tempPartsList.reduce((acc, p) => acc + p.price, 0);
    const workSum = Number(document.getElementById("modal-work-price").value);
    document.getElementById("modal-total-price").textContent =
      partsSum + workSum + " грн";
  }

  // Зміна ціни роботи "на льоту" оновлює загальну суму
  document
    .getElementById("modal-work-price")
    .addEventListener("input", updateModalPartsList);

  window.removeTempPart = (index) => {
    tempPartsList.splice(index, 1);
    updateModalPartsList();
  };

  // ЗБЕРЕЖЕННЯ ЗАМОВЛЕННЯ
  document.getElementById("btn-save-order").addEventListener("click", () => {
    if (!currentEditingOrder) return;

    // Списуємо запчастини зі складу
    const oldPartsCount = currentEditingOrder.parts.length;
    const newParts = tempPartsList.slice(oldPartsCount);

    newParts.forEach((p) => {
      PartService.decreaseStock(p.id, 1);
    });

    // Оновлюємо об'єкт замовлення
    currentEditingOrder.parts = tempPartsList;
    currentEditingOrder.workPrice = Number(
      document.getElementById("modal-work-price").value
    );
    currentEditingOrder.status = document.getElementById("modal-status").value;
    currentEditingOrder.totalPrice =
      currentEditingOrder.parts.reduce((acc, p) => acc + p.price, 0) +
      currentEditingOrder.workPrice;

    OrderService.update(currentEditingOrder);

    // Закриваємо модалку
    bootstrap.Modal.getInstance(
      document.getElementById("manageOrderModal")
    ).hide();

    renderOrders();
    renderWarehouse(); // Оновити склад, бо кількість зменшилась
    alert("Замовлення оновлено!");
  });

  renderWarehouse();
  renderOrders();
}

// Допоміжна функція для кольорів статусів
function getStatusColor(status) {
  if (status === "Новий") return "primary";
  if (status === "В роботі") return "warning";
  if (status === "Виконано") return "success";
  return "secondary";
}

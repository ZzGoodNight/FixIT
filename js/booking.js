// js/booking.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Перевірка авторизації
  const currentUser = UserService.getCurrentUser();
  if (!currentUser) {
    alert("Щоб записатись, будь ласка, увійдіть в систему.");
    window.location.href = "/pages/login.html";
    return;
  }

  // 2. Ініціалізація елементів
  const carSelect = document.getElementById("booking-car-select");
  const serviceSelect = document.getElementById("booking-service-select");
  const dateInput = document.getElementById("booking-date");
  const timeGrid = document.getElementById("time-grid");
  const confirmBtn = document.getElementById("confirm-btn");
  const noCarWarning = document.getElementById("no-car-warning");

  let selectedTime = null;

  // 3. Завантаження списку авто клієнта
  const cars = CarService.getByClientId(currentUser.id);
  if (cars.length === 0) {
    carSelect.disabled = true;
    noCarWarning.classList.remove("d-none");
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Спочатку додайте авто в кабінеті";
  } else {
    carSelect.innerHTML = cars
      .map(
        (c) =>
          `<option value="${c.id}">${c.make} ${c.model} (${c.plate})</option>`
      )
      .join("");
  }

  // 4. Логіка календаря
  dateInput.value = new Date().toISOString().split("T")[0]; // Сьогоднішня дата
  dateInput.min = new Date().toISOString().split("T")[0]; // Не можна вибрати минуле

  dateInput.addEventListener("change", renderTimeSlots);

  function renderTimeSlots() {
    const date = dateInput.value;
    const allOrders = OrderService.getAll();
    const workHours = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
    ];

    timeGrid.innerHTML = "";
    selectedTime = null;
    confirmBtn.disabled = true;

    workHours.forEach((time) => {
      // Перевіряємо, чи зайнятий слот
      const isBusy = allOrders.find(
        (o) => o.date === date && o.time === time && o.status !== "Скасовано"
      );

      const col = document.createElement("div");
      col.className = "col-6 col-sm-4 col-md-3";

      const slot = document.createElement("div");
      slot.className = `time-slot p-3 border rounded fw-bold ${
        isBusy ? "busy" : "free"
      }`;
      slot.textContent = time;

      if (isBusy) {
        slot.title = "Цей час вже зайнято";
      } else {
        slot.onclick = () => {
          // Знімаємо виділення з усіх
          document
            .querySelectorAll(".time-slot")
            .forEach((el) => el.classList.remove("selected"));
          // Виділяємо поточний
          slot.classList.add("selected");
          selectedTime = time;

          if (cars.length > 0) confirmBtn.disabled = false;
        };
      }

      col.appendChild(slot);
      timeGrid.appendChild(col);
    });
  }

  // 5. Підтвердження запису
  confirmBtn.addEventListener("click", () => {
    if (!selectedTime || !carSelect.value) return;

    try {
      const carNameText = carSelect.options[carSelect.selectedIndex].text;

      OrderService.create({
        clientId: currentUser.id,
        carId: carSelect.value,
        carName: carNameText,
        service: serviceSelect.value,
        date: dateInput.value,
        time: selectedTime,
      });

      alert(`Успішно! Чекаємо вас ${dateInput.value} о ${selectedTime}.`);
      window.location.href = "/pages/dashboard.html"; // Перекидаємо в кабінет для перегляду історії
    } catch (e) {
      alert(e.message);
    }
  });

  // Запуск рендеру при старті
  renderTimeSlots();
});

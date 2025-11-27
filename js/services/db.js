// js/services/db.js

const DB_KEYS = {
  USERS: "fixit_users",
  CARS: "fixit_cars",
  ORDERS: "fixit_orders",
  PARTS: "fixit_parts", // НОВЕ: Склад
  CURRENT_USER: "fixit_current_user",
};

function initDB() {
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    console.log("Ініціалізація бази...");

    // Юзери
    const users = [
      {
        id: "emp1",
        email: "admin@fixit.com",
        password: "admin",
        name: "Головний Механік",
        role: "employee",
      },
      {
        id: "client1",
        email: "client@test.com",
        password: "123",
        name: "Іван Тестовий",
        role: "client",
      },
    ];

    // Авто
    const cars = [
      {
        id: "car1",
        clientId: "client1",
        make: "Toyota",
        model: "Camry",
        plate: "AA1111AA",
        vin: "JTNBE40K500200300",
      },
    ];

    // Замовлення
    const orders = [
      {
        id: "ord1",
        clientId: "client1",
        carId: "car1",
        carName: "Toyota Camry",
        service: "Заміна мастила",
        date: new Date().toISOString().split("T")[0],
        time: "10:00", // Додали час
        status: "Новий",
        parts: [],
        workPrice: 0,
        totalPrice: 0,
      },
    ];

    // НОВЕ: Запчастини на складі
    const parts = [
      {
        id: "p1",
        name: "Мастило 5W-30 (5л)",
        type: "original",
        price: 1500,
        quantity: 10,
      },
      {
        id: "p2",
        name: "Фільтр масляний",
        type: "replica",
        price: 300,
        quantity: 20,
      },
      {
        id: "p3",
        name: "Гальмівні колодки",
        type: "original",
        price: 2200,
        quantity: 5,
      },
    ];

    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(DB_KEYS.CARS, JSON.stringify(cars));
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    localStorage.setItem(DB_KEYS.PARTS, JSON.stringify(parts));
  }
}

// --- User Service (без змін) ---
const UserService = {
  getAll: () => JSON.parse(localStorage.getItem(DB_KEYS.USERS) || "[]"),
  register: (user) => {
    const users = UserService.getAll();
    if (users.find((u) => u.email === user.email))
      throw new Error("Email зайнятий");
    user.id = "u_" + Date.now();
    user.role = "client";
    users.push(user);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    return user;
  },
  login: (email, pass) => {
    const user = UserService.getAll().find(
      (u) => u.email === email && u.password === pass
    );
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    throw new Error("Помилка входу");
  },
  getCurrentUser: () => JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER)),
  logout: () => {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
    window.location.href = "/index.html";
  },
};

// --- Car Service (без змін) ---
const CarService = {
  getByClientId: (cid) =>
    JSON.parse(localStorage.getItem(DB_KEYS.CARS) || "[]").filter(
      (c) => c.clientId === cid
    ),
  add: (car) => {
    const cars = JSON.parse(localStorage.getItem(DB_KEYS.CARS) || "[]");
    car.id = "c_" + Date.now();
    cars.push(car);
    localStorage.setItem(DB_KEYS.CARS, JSON.stringify(cars));
  },
  delete: (id) => {
    const cars = JSON.parse(localStorage.getItem(DB_KEYS.CARS) || "[]").filter(
      (c) => c.id !== id
    );
    localStorage.setItem(DB_KEYS.CARS, JSON.stringify(cars));
  },
};

// --- НОВЕ: Part Service (Склад) ---
const PartService = {
  getAll: () => JSON.parse(localStorage.getItem(DB_KEYS.PARTS) || "[]"),

  add: (part) => {
    const parts = PartService.getAll();
    part.id = "p_" + Date.now();
    parts.push(part);
    localStorage.setItem(DB_KEYS.PARTS, JSON.stringify(parts));
  },

  // Списання запчастин зі складу
  decreaseStock: (partId, qty) => {
    const parts = PartService.getAll();
    const part = parts.find((p) => p.id === partId);
    if (part && part.quantity >= qty) {
      part.quantity -= qty;
      localStorage.setItem(DB_KEYS.PARTS, JSON.stringify(parts));
      return true;
    }
    return false;
  },
};

// --- Order Service (Оновлений) ---
const OrderService = {
  getAll: () => JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || "[]"),

  create: (order) => {
    const orders = OrderService.getAll();
    // Перевірка чи слот вільний
    const isBusy = orders.find(
      (o) =>
        o.date === order.date &&
        o.time === order.time &&
        o.status !== "Скасовано"
    );
    if (isBusy) throw new Error("Цей час вже зайнято!");

    order.id = "o_" + Date.now();
    order.status = "Новий";
    order.parts = []; // Список використаних запчастин
    order.workPrice = 0;
    order.totalPrice = 0;
    orders.push(order);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
  },

  update: (updatedOrder) => {
    const orders = OrderService.getAll();
    const idx = orders.findIndex((o) => o.id === updatedOrder.id);
    if (idx !== -1) {
      orders[idx] = updatedOrder;
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    }
  },
};

initDB();

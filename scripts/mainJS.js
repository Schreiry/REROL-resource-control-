/*******************************************************
 * Глобальные переменные
 *******************************************************/

// Храним в памяти текущего пользователя (после входа)
let currentUser = null;

// «Блокчейн»-подобный лог (массив блоков). 
// Каждый блок: { index, timestamp, user, action, data, previousHash, hash }
let blockchain = [];

// Вспомогательная функция для генерации простого хэша
function simpleHash(input) {
  // Самый простой способ - хешировать через встроенный btoa или MD5/SHA1-библиотеки.
  // Здесь упрощённо используем btoa + какую-то «примесь».
  return btoa(unescape(encodeURIComponent(input))).slice(0, 16);
}

// Генерация нового блока в «блокчейне»
function createBlock(user, action, data) {
  const timestamp = new Date().toISOString();
  const index = blockchain.length;
  const previousHash = blockchain.length === 0 ? "0" : blockchain[blockchain.length - 1].hash;
  const rawData = index + timestamp + user + action + JSON.stringify(data) + previousHash;
  const hash = simpleHash(rawData);

  const block = {
    index,
    timestamp,
    user,
    action,
    data,
    previousHash,
    hash
  };

  // Добавляем в цепочку
  blockchain.push(block);

  // Сохраняем в localStorage
  localStorage.setItem("blockchainLog", JSON.stringify(blockchain));
}

// Восстановим блокчейн из localStorage, если он там есть
function loadBlockchain() {
  const stored = localStorage.getItem("blockchainLog");
  if (stored) {
    blockchain = JSON.parse(stored);
  } else {
    blockchain = [];
  }
}

// Сохраняем пользователей в localStorage (простой способ)
function getUsersFromStorage() {
  const usersStr = localStorage.getItem("users");
  if (usersStr) {
    return JSON.parse(usersStr);
  }
  return [];
}

function setUsersToStorage(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Сохраняем объекты (коробки, органайзеры) в localStorage
function getObjectsFromStorage() {
  const objectsStr = localStorage.getItem("objects");
  if (objectsStr) {
    return JSON.parse(objectsStr);
  }
  return [];
}

function setObjectsToStorage(objects) {
  localStorage.setItem("objects", JSON.stringify(objects));
}

// Загрузка данных при старте
loadBlockchain();


/*******************************************************
 * Функции для регистрации / входа / выхода
 *******************************************************/

// Открыть модальное окно
function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

// Закрыть модальное окно
function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

// Регистрация
function registerUser() {
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!username || !password) {
    alert("Пожалуйста, введите имя и пароль.");
    return;
  }

  const users = getUsersFromStorage();
  // Проверяем, не занято ли имя
  if (users.some(u => u.username === username)) {
    alert("Пользователь с таким именем уже существует!");
    return;
  }

  // Создаём нового пользователя
  users.push({ username, password });
  setUsersToStorage(users);

  // Логируем событие
  createBlock(username, "REGISTER", { username });

  alert("Регистрация успешна!");
  closeModal("register-modal");
}

// Вход
function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    alert("Пожалуйста, введите имя и пароль.");
    return;
  }

  const users = getUsersFromStorage();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    currentUser = user.username;
    // Логируем событие
    createBlock(currentUser, "LOGIN", { username: currentUser });

    // Скрываем блок авторизации, показываем основной контент
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
    document.getElementById("export-log-section").classList.remove("hidden");

    // Отображаем имя пользователя
    document.getElementById("current-user").textContent = "Пользователь: " + currentUser;

    closeModal("login-modal");
  } else {
    alert("Неверные имя или пароль!");
  }
}

// Выход
function logoutUser() {
  if (currentUser) {
    createBlock(currentUser, "LOGOUT", { username: currentUser });
  }
  currentUser = null;

  // Снова показываем блок авторизации, скрываем основной контент
  document.getElementById("auth-section").classList.remove("hidden");
  document.getElementById("main-content").classList.add("hidden");
  document.getElementById("export-log-section").classList.add("hidden");
}

/*******************************************************
 * Функции для создания и отображения объектов
 *******************************************************/

// Показать форму для создания объекта
function showCreateObjectModal() {
  // Сброс полей
  document.getElementById("object-type").value = "";
  document.getElementById("box-color").value = "#ffff00";
  document.getElementById("box-purpose").value = "";
  document.getElementById("organizer-purpose").value = "";
  document.getElementById("organizer-color").value = "#ff0000";
  document.getElementById("organizer-cells").value = 10;

  // Скрыть все параметры
  document.getElementById("box-params").classList.add("hidden");
  document.getElementById("organizer-params").classList.add("hidden");

  openModal("create-object-modal");
}

// Изменение полей в зависимости от типа объекта
function onObjectTypeChange() {
  const type = document.getElementById("object-type").value;
  if (type === "box") {
    document.getElementById("box-params").classList.remove("hidden");
    document.getElementById("organizer-params").classList.add("hidden");
  } else if (type === "organizer") {
    document.getElementById("box-params").classList.add("hidden");
    document.getElementById("organizer-params").classList.remove("hidden");
  } else {
    // Ничего не выбрано
    document.getElementById("box-params").classList.add("hidden");
    document.getElementById("organizer-params").classList.add("hidden");
  }
}

// Создать объект (коробка или органайзер)
function createObject() {
  const type = document.getElementById("object-type").value;
  if (!type) {
    alert("Выберите тип объекта!");
    return;
  }

  const objects = getObjectsFromStorage();

  if (type === "box") {
    const color = document.getElementById("box-color").value;
    const purpose = document.getElementById("box-purpose").value.trim();

    // Создаём объект-коробку
    const newBox = {
      id: Date.now(), // уникальный id
      type: "box",
      color,
      purpose
    };

    objects.push(newBox);
    setObjectsToStorage(objects);

    // Логируем
    createBlock(currentUser, "CREATE_BOX", newBox);

  } else if (type === "organizer") {
    const purpose = document.getElementById("organizer-purpose").value.trim();
    const color = document.getElementById("organizer-color").value;
    const cellsCount = parseInt(document.getElementById("organizer-cells").value, 10);

    // Формируем массив ячеек
    const cells = [];
    for (let i = 0; i < cellsCount; i++) {
      cells.push({
        cellIndex: i,
        productName: "",
        quantity: 0
      });
    }

    const newOrganizer = {
      id: Date.now(),
      type: "organizer",
      color,
      purpose,
      cells
    };

    objects.push(newOrganizer);
    setObjectsToStorage(objects);

    // Логируем
    createBlock(currentUser, "CREATE_ORGANIZER", newOrganizer);
  }

  closeModal("create-object-modal");
  renderObjects();
}

// Отрисовать все объекты на главной странице
function renderObjects() {
  const container = document.getElementById("objects-container");
  container.innerHTML = "";

  const objects = getObjectsFromStorage();

  objects.forEach(obj => {
    const card = document.createElement("div");
    card.classList.add("object-card");

    // Если это коробка
    if (obj.type === "box") {
      card.style.backgroundColor = obj.color;
      const title = document.createElement("div");
      title.classList.add("object-title");
      title.textContent = obj.purpose || "Без названия (коробка)";
      card.appendChild(title);

      // Можно добавить иконку или что-то ещё при желании.

      // При клике на коробку: можно показать меню (если нужно).
      card.addEventListener("click", () => {
        alert(`Это коробка: ${obj.purpose}\nID: ${obj.id}`);
        // Или реализовать другое меню
      });

    } 
    // Если это органайзер
    else if (obj.type === "organizer") {
      card.style.borderColor = obj.color; // цвет рамки — цвет органайзера
      const title = document.createElement("div");
      title.classList.add("object-title");
      title.textContent = obj.purpose || "Без названия (органайзер)";
      card.appendChild(title);

      // Блок ячеек
      const cellsWrapper = document.createElement("div");
      cellsWrapper.classList.add("organizer-cells");

      obj.cells.forEach(cell => {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("organizer-cell");
        cellDiv.textContent = cell.cellIndex; // Нумерация ячейки

        // При клике на ячейку открываем модальное окно редактирования
        cellDiv.addEventListener("click", (e) => {
          // Останавливаем всплытие, чтобы клик не сработал на card
          e.stopPropagation();

          // Добавим класс "active" для анимации
          cellDiv.classList.add("active");
          setTimeout(() => {
            cellDiv.classList.remove("active");
          }, 500);

          openCellModal(obj.id, cell.cellIndex);
        });

        cellsWrapper.appendChild(cellDiv);
      });

      card.appendChild(cellsWrapper);

      // При клике на саму карточку органайзера (не на ячейки)
      card.addEventListener("click", () => {
        alert(`Это органайзер: ${obj.purpose}\nID: ${obj.id}\nКоличество ячеек: ${obj.cells.length}`);
      });
    }

    container.appendChild(card);
  });
}

/*******************************************************
 * Функции для работы с ячейками органайзера
 *******************************************************/

// Открыть модальное окно для редактирования конкретной ячейки
function openCellModal(organizerId, cellIndex) {
  // Сохраним эти данные во временных атрибутах
  const cellModal = document.getElementById("cell-modal");
  cellModal.setAttribute("data-organizer-id", organizerId);
  cellModal.setAttribute("data-cell-index", cellIndex);

  // Найдём саму ячейку в данных
  const objects = getObjectsFromStorage();
  const organizer = objects.find(o => o.id === organizerId);
  if (!organizer) return;

  const cellData = organizer.cells.find(c => c.cellIndex === cellIndex);

  // Заполним поля
  document.getElementById("cell-number").textContent = cellIndex;
  document.getElementById("cell-product").value = cellData.productName;
  document.getElementById("cell-quantity").value = cellData.quantity;

  openModal("cell-modal");
}

// Сохранить изменения по ячейке
function saveCellChanges() {
  const cellModal = document.getElementById("cell-modal");
  const organizerId = parseInt(cellModal.getAttribute("data-organizer-id"), 10);
  const cellIndex = parseInt(cellModal.getAttribute("data-cell-index"), 10);

  const productName = document.getElementById("cell-product").value.trim();
  const quantity = parseInt(document.getElementById("cell-quantity").value, 10);

  // Найдём организер в списке
  const objects = getObjectsFromStorage();
  const organizer = objects.find(o => o.id === organizerId);
  if (!organizer) return;

  const cellData = organizer.cells.find(c => c.cellIndex === cellIndex);
  if (!cellData) return;

  // Обновляем
  cellData.productName = productName;
  cellData.quantity = quantity;

  // Сохраняем
  setObjectsToStorage(objects);

  // Логируем
  createBlock(currentUser, "UPDATE_CELL", {
    organizerId,
    cellIndex,
    productName,
    quantity
  });

  closeModal("cell-modal");
  renderObjects();
}

// Уменьшить/увеличить количество продукта
function changeCellQuantity(delta) {
  const input = document.getElementById("cell-quantity");
  let value = parseInt(input.value, 10);
  value += delta;
  if (value < 0) value = 0; // не даём уйти в отрицательные числа
  input.value = value;
}

/*******************************************************
 * Функции экспорта лога
 *******************************************************/

// Выгрузить лог в текстовый файл
function exportLog() {
  // Соберём содержимое лога
  let logText = "Index | Timestamp           | User        | Action            | Data\n";
  logText += "-------------------------------------------------------------------------\n";
  blockchain.forEach(block => {
    logText += `${block.index} | ${block.timestamp} | ${block.user} | ${block.action} | ${JSON.stringify(block.data)}\n`;
  });

  // Создадим «файл» на лету
  const blob = new Blob([logText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  // Создадим временную ссылку и кликнем по ней
  const a = document.createElement("a");
  a.href = url;
  a.download = "log.txt";
  document.body.appendChild(a);
  a.click();

  // Удалим ссылку
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/*******************************************************
 * Навешиваем слушатели событий при загрузке страницы
 *******************************************************/
window.addEventListener("DOMContentLoaded", () => {
  // Кнопки открытия модалок
  document.getElementById("register-btn").addEventListener("click", () => openModal("register-modal"));
  document.getElementById("login-btn").addEventListener("click", () => openModal("login-modal"));
  document.getElementById("add-object-btn").addEventListener("click", showCreateObjectModal);

  // Кнопки закрытия модалок (крестики)
  document.querySelectorAll(".close").forEach(closeBtn => {
    closeBtn.addEventListener("click", (e) => {
      const modalId = e.target.getAttribute("data-close");
      closeModal(modalId);
    });
  });

  // Кнопки «Зарегистрироваться» и «Войти»
  document.getElementById("submit-register").addEventListener("click", registerUser);
  document.getElementById("submit-login").addEventListener("click", loginUser);

  // Кнопка «Выйти»
  document.getElementById("logout-btn").addEventListener("click", logoutUser);

  // Изменение типа объекта в модальном окне
  document.getElementById("object-type").addEventListener("change", onObjectTypeChange);

  // Кнопка «Создать объект»
  document.getElementById("create-object-confirm").addEventListener("click", createObject);

  // Модальное окно ячейки
  document.getElementById("cell-quantity-minus").addEventListener("click", () => changeCellQuantity(-1));
  document.getElementById("cell-quantity-plus").addEventListener("click", () => changeCellQuantity(1));
  document.getElementById("cell-save-btn").addEventListener("click", saveCellChanges);

  // Кнопка экспорта лога
  document.getElementById("export-log-btn").addEventListener("click", exportLog);

  // При загрузке сразу рендерим объекты (если вдруг уже что-то создано)
  renderObjects();
});

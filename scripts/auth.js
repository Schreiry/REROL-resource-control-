// // js/auth.js

// import { createBlock } from "./BlockChain.js";
// import { getUsersFromStorage, setUsersToStorage } from "./Storage.js";

// // Текущий пользователь
// let currentUser = null;

// /**
//  * Геттер для currentUser
//  */
// function getCurrentUser() {
//   return currentUser;
// }

// /**
//  * Регистрация нового пользователя
//  */
// function registerUser() {
//   const username = document.getElementById("reg-username").value.trim();
//   const password = document.getElementById("reg-password").value;

//   if (!username || !password) {
//     alert("Please enter your name and password.");
//     return;
//   }

//   const users = getUsersFromStorage();
//   if (users.some(u => u.username === username)) {
//     alert("A user with this name already exists!");
//     return;
//   }

//   users.push({ username, password });
//   setUsersToStorage(users);

//   createBlock(username, "REGISTER", { username });
//   alert("Registration successful!");

//   // Закрываем модальное окно
//   document.getElementById("register-modal").classList.add("hidden");
// }

// /**
//  * Вход (логин)
//  */
// function loginUser() {
//   const username = document.getElementById("login-username").value.trim();
//   const password = document.getElementById("login-password").value;

//   if (!username || !password) {
//     alert("Please enter your name and password.");
//     return;
//   }

//   const users = getUsersFromStorage();
//   const user = users.find(u => u.username === username && u.password === password);

//   if (user) {
//     currentUser = user.username;
//     createBlock(currentUser, "LOGIN", { username: currentUser });

//     // Показываем основной контент, скрываем блок авторизации
//     document.getElementById("auth-section").classList.add("hidden");
//     document.getElementById("main-content").classList.remove("hidden");
//     document.getElementById("export-log-section").classList.remove("hidden");

//     // Отображаем имя пользователя
//     document.getElementById("current-user").textContent = "Пользователь: " + currentUser;

//     // Закрываем модальное окно
//     document.getElementById("login-modal").classList.add("hidden");
//   } else {
//     alert("Incorrect username or password! Be careful. Have you forgotten?");
//   }
// }

// /**
//  * Выход (логаут)
//  */
// function logoutUser() {
//   if (currentUser) {
//     createBlock(currentUser, "LOGOUT", { username: currentUser });
//   }
//   currentUser = null;

//   document.getElementById("auth-section").classList.remove("hidden");
//   document.getElementById("main-content").classList.add("hidden");
//   document.getElementById("export-log-section").classList.add("hidden");
// }

// export {
//   getCurrentUser,
//   registerUser,
//   loginUser,
//   logoutUser
// };

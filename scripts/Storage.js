// // js/storage.js

// /**
//  * Получаем список пользователей из localStorage
//  */
// function getUsersFromStorage() {
//     const usersStr = localStorage.getItem("users");
//     if (usersStr) {
//       return JSON.parse(usersStr);
//     }
//     return [];
//   }
  
//   function setUsersToStorage(users) {
//     localStorage.setItem("users", JSON.stringify(users));
//   }
  
//   /**
//    * Получаем список объектов (коробки, органайзеры) из localStorage
//    */
//   function getObjectsFromStorage() {
//     const objectsStr = localStorage.getItem("objects");
//     if (objectsStr) {
//       return JSON.parse(objectsStr);
//     }
//     return [];
//   }
  
//   function setObjectsToStorage(objects) {
//     localStorage.setItem("objects", JSON.stringify(objects));
//   }
  
//   // Экспортируем
//   export {
//     getUsersFromStorage,
//     setUsersToStorage,
//     getObjectsFromStorage,
//     setObjectsToStorage
//   };
  
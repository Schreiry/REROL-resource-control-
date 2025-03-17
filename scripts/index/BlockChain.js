// // js/blockchain.js

// // Храним массив «блоков» здесь
// let blockchain = [];

// /**
//  * Простая хеш-функция для демонстрации
//  */
// function simpleHash(input) {
//   // Самый простой способ — использовать btoa + небольшую примесь
//   return btoa(unescape(encodeURIComponent(input))).slice(0, 16);
// }

// /**
//  * Создание нового блока в «блокчейне»
//  */
// function createBlock(user, action, data) {
//   const timestamp = new Date().toISOString();
//   const index = blockchain.length;
//   const previousHash = (blockchain.length === 0) ? "0" : blockchain[blockchain.length - 1].hash;
//   const rawData = index + timestamp + user + action + JSON.stringify(data) + previousHash;
//   const hash = simpleHash(rawData);

//   const block = {
//     index,
//     timestamp,
//     user,
//     action,
//     data,
//     previousHash,
//     hash
//   };

//   blockchain.push(block);

//   // Сохраняем в localStorage
//   localStorage.setItem("blockchainLog", JSON.stringify(blockchain));
// }

// /**
//  * Загрузка «блокчейна» из localStorage (если есть)
//  */
// function loadBlockchain() {
//   const stored = localStorage.getItem("blockchainLog");
//   if (stored) {
//     blockchain = JSON.parse(stored);
//   } else {
//     blockchain = [];
//   }
// }

// /**
//  * Возвращает текущий массив blockchain
//  */
// function getBlockchain() {
//   return blockchain;
// }

// /**
//  * Экспорт лога в текстовый файл (использует текущий массив blockchain)
//  */
// function exportLog() {
//   let logText = "Index | Timestamp           | User        | Action            | Data\n";
//   logText += "-------------------------------------------------------------------------\n";
//   blockchain.forEach(block => {
//     logText += `${block.index} | ${block.timestamp} | ${block.user} | ${block.action} | ${JSON.stringify(block.data)}\n`;
//   });

//   const blob = new Blob([logText], { type: "text/plain" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "log.txt";
//   document.body.appendChild(a);
//   a.click();

//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
// }

// // Экспортируем функции, которые нужны снаружи
// export {
//   createBlock,
//   loadBlockchain,
//   getBlockchain,
//   exportLog
// };

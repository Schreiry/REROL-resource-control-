// // js/objects.js

// import { createBlock } from "./BlockChain.js";
// import { getObjectsFromStorage, setObjectsToStorage } from "./Storage.js";
// import { getCurrentUser } from "./auth.js";

// /**
//  * Показать модалку для создания объекта
//  */
// function showCreateObjectModal() {
//   document.getElementById("object-type").value = "";
//   document.getElementById("box-color").value = "#ffff00";
//   document.getElementById("box-purpose").value = "";
//   document.getElementById("organizer-purpose").value = "";
//   document.getElementById("organizer-color").value = "#ff0000";
//   document.getElementById("organizer-cells").value = 10;

//   document.getElementById("box-params").classList.add("hidden");
//   document.getElementById("organizer-params").classList.add("hidden");

//   document.getElementById("create-object-modal").classList.remove("hidden");
// }

// /**
//  * При выборе типа объекта в селекте
//  */
// function onObjectTypeChange() {
//   const type = document.getElementById("object-type").value;
//   if (type === "box") {
//     document.getElementById("box-params").classList.remove("hidden");
//     document.getElementById("organizer-params").classList.add("hidden");
//   } else if (type === "organizer") {
//     document.getElementById("box-params").classList.add("hidden");
//     document.getElementById("organizer-params").classList.remove("hidden");
//   } else {
//     document.getElementById("box-params").classList.add("hidden");
//     document.getElementById("organizer-params").classList.add("hidden");
//   }
// }

// /**
//  * Создать объект (коробка или органайзер)
//  */
// function createObject() {
//   const type = document.getElementById("object-type").value;
//   if (!type) {
//     alert("Select object type!");
//     return;
//   }

//   const currentUser = getCurrentUser(); // кто создаёт
//   const objects = getObjectsFromStorage();

//   if (type === "box") {
//     const color = document.getElementById("box-color").value;
//     const purpose = document.getElementById("box-purpose").value.trim();

//     const newBox = {
//       id: Date.now(),
//       type: "box",
//       color,
//       purpose
//     };
//     objects.push(newBox);
//     setObjectsToStorage(objects);

//     createBlock(currentUser, "CREATE_BOX", newBox);

//   } else if (type === "organizer") {
//     const purpose = document.getElementById("organizer-purpose").value.trim();
//     const color = document.getElementById("organizer-color").value;
//     const cellsCount = parseInt(document.getElementById("organizer-cells").value, 10);

//     const cells = [];
//     for (let i = 0; i < cellsCount; i++) {
//       cells.push({
//         cellIndex: i,
//         productName: "",
//         quantity: 0
//       });
//     }

//     const newOrganizer = {
//       id: Date.now(),
//       type: "organizer",
//       color,
//       purpose,
//       cells
//     };
//     objects.push(newOrganizer);
//     setObjectsToStorage(objects);

//     createBlock(currentUser, "CREATE_ORGANIZER", newOrganizer);
//   }

//   document.getElementById("create-object-modal").classList.add("hidden");
//   renderObjects();
// }

// /**
//  * Отрисовать все объекты
//  */
// function renderObjects() {
//   const container = document.getElementById("objects-container");
//   container.innerHTML = "";

//   const objects = getObjectsFromStorage();

//   objects.forEach(obj => {
//     const card = document.createElement("div");
//     card.classList.add("object-card");

//     if (obj.type === "box") {
//       card.style.backgroundColor = obj.color;
//       const title = document.createElement("div");
//       title.classList.add("object-title");
//       title.textContent = obj.purpose || "Untitled (box)";
//       card.appendChild(title);

//       card.addEventListener("click", () => {
//         alert(`This box: ${obj.purpose}\nID: ${obj.id}`);
//       });
//     } else if (obj.type === "organizer") {
//       card.style.borderColor = obj.color;
//       const title = document.createElement("div");
//       title.classList.add("object-title");
//       title.textContent = obj.purpose || "Untitled (organizer)";
//       card.appendChild(title);

//       const cellsWrapper = document.createElement("div");
//       cellsWrapper.classList.add("organizer-cells");

//       obj.cells.forEach(cell => {
//         const cellDiv = document.createElement("div");
//         cellDiv.classList.add("organizer-cell");
//         cellDiv.textContent = cell.cellIndex;

//         cellDiv.addEventListener("click", (e) => {
//           e.stopPropagation();
//           cellDiv.classList.add("active");
//           setTimeout(() => cellDiv.classList.remove("active"), 500);
//           openCellModal(obj.id, cell.cellIndex);
//         });

//         cellsWrapper.appendChild(cellDiv);
//       });

//       card.appendChild(cellsWrapper);

//       card.addEventListener("click", () => {
//         alert(`Organizer: ${obj.purpose}\nID: ${obj.id}\nCells: ${obj.cells.length}`);
//       });
//     }

//     // Блок кнопок "Duplicate" и "Delete"
//     const actionsDiv = document.createElement("div");
//     actionsDiv.classList.add("object-actions");

//     const duplicateBtn = document.createElement("button");
//     duplicateBtn.textContent = "Duplicate";
//     duplicateBtn.addEventListener("click", (e) => {
//       e.stopPropagation();
//       duplicateObject(obj.id);
//     });

//     const deleteBtn = document.createElement("button");
//     deleteBtn.textContent = "Delete";
//     deleteBtn.addEventListener("click", (e) => {
//       e.stopPropagation();
//       deleteObjectWithAnimation(obj.id, card);
//     });

//     actionsDiv.appendChild(duplicateBtn);
//     actionsDiv.appendChild(deleteBtn);
//     card.appendChild(actionsDiv);

//     container.appendChild(card);
//   });
// }

// /**
//  * Открыть модалку редактирования конкретной ячейки
//  */
// function openCellModal(organizerId, cellIndex) {
//   const cellModal = document.getElementById("cell-modal");
//   cellModal.setAttribute("data-organizer-id", organizerId);
//   cellModal.setAttribute("data-cell-index", cellIndex);

//   const objects = getObjectsFromStorage();
//   const organizer = objects.find(o => o.id === organizerId);
//   if (!organizer) return;

//   const cellData = organizer.cells.find(c => c.cellIndex === cellIndex);

//   document.getElementById("cell-number").textContent = cellIndex;
//   document.getElementById("cell-product").value = cellData.productName;
//   document.getElementById("cell-quantity").value = cellData.quantity;

//   cellModal.classList.remove("hidden");
// }

// /**
//  * Сохранить изменения по ячейке
//  */
// function saveCellChanges() {
//   const cellModal = document.getElementById("cell-modal");
//   const organizerId = parseInt(cellModal.getAttribute("data-organizer-id"), 10);
//   const cellIndex = parseInt(cellModal.getAttribute("data-cell-index"), 10);

//   const productName = document.getElementById("cell-product").value.trim();
//   const quantity = parseInt(document.getElementById("cell-quantity").value, 10);

//   const objects = getObjectsFromStorage();
//   const organizer = objects.find(o => o.id === organizerId);
//   if (!organizer) return;

//   const cellData = organizer.cells.find(c => c.cellIndex === cellIndex);
//   if (!cellData) return;

//   cellData.productName = productName;
//   cellData.quantity = quantity;
//   setObjectsToStorage(objects);

//   const currentUser = getCurrentUser();
//   createBlock(currentUser, "UPDATE_CELL", { organizerId, cellIndex, productName, quantity });

//   cellModal.classList.add("hidden");
//   renderObjects();
// }

// /**
//  * Уменьшить/увеличить количество в поле ячейки
//  */
// function changeCellQuantity(delta) {
//   const input = document.getElementById("cell-quantity");
//   let value = parseInt(input.value, 10);
//   value += delta;
//   if (value < 0) value = 0;
//   input.value = value;
// }

// /**
//  * Дублировать объект
//  */
// function duplicateObject(id) {
//   const objects = getObjectsFromStorage();
//   const obj = objects.find(o => o.id === id);
//   if (!obj) return;

//   const newObj = JSON.parse(JSON.stringify(obj));
//   newObj.id = Date.now();

//   objects.push(newObj);
//   setObjectsToStorage(objects);

//   const currentUser = getCurrentUser();
//   createBlock(currentUser, "DUPLICATE_OBJECT", { originalId: id, newId: newObj.id });

//   renderObjects();
// }

// /**
//  * Удалить объект с анимацией "улёта" в корзину
//  */
// function deleteObjectWithAnimation(id, cardElement) {
//   const clone = cardElement.cloneNode(true);
//   const rect = cardElement.getBoundingClientRect();

//   clone.style.position = "absolute";
//   clone.style.top = rect.top + "px";
//   clone.style.left = rect.left + "px";
//   clone.style.width = rect.width + "px";
//   clone.style.height = rect.height + "px";
//   clone.style.transition = "transform 0.8s ease-in-out, opacity 0.8s ease-in-out";
//   clone.style.zIndex = 1000;

//   document.body.appendChild(clone);
//   cardElement.remove();

//   const trashRect = document.getElementById("trash-can").getBoundingClientRect();
//   const targetX = trashRect.left + trashRect.width / 2 - (rect.left + rect.width / 2);
//   const targetY = trashRect.top + trashRect.height / 2 - (rect.top + rect.height / 2);

//   requestAnimationFrame(() => {
//     clone.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.1)`;
//     clone.style.opacity = "0";
//   });

//   clone.addEventListener("transitionend", () => {
//     clone.remove();

//     const objects = getObjectsFromStorage();
//     const index = objects.findIndex(o => o.id === id);
//     if (index !== -1) {
//       objects.splice(index, 1);
//       setObjectsToStorage(objects);

//       const currentUser = getCurrentUser();
//       createBlock(currentUser, "DELETE_OBJECT", { deletedId: id });
//     }

//     renderObjects();
//   }, { once: true });
// }

// // Экспортируем все нужные функции
// export {
//   showCreateObjectModal,
//   onObjectTypeChange,
//   createObject,
//   renderObjects,
//   openCellModal,
//   saveCellChanges,
//   changeCellQuantity,
//   duplicateObject,
//   deleteObjectWithAnimation
// };

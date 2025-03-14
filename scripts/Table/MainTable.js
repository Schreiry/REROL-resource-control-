/*******************************************************
 * Global / Helper
 *******************************************************/

/**
 * We assume the "main page" uses localStorage["objects"] to store:
 *  - Box:       { id, type: "box", color, purpose, capacity, items }
 *  - Organizer: { id, type: "organizer", color, purpose, cells: [...] }
 *  - Table:     { id, type: "table", orientation, tableNumber, boxCount, organizerCount }
 *
 * For each row in this "Products Table", we have:
 *  - productName
 *  - cellIndex (optional)
 *  - organizerName (optional)
 *  - boxName (optional)
 *  - quantity
 *
 * We'll interpret the data as:
 *  - If "organizerName" is filled, we create/find an Organizer object.
 *    - If "cellIndex" is given, we update that cell's productName & quantity.
 *  - If "boxName" is filled, we create/find a Box object.
 *    - We can treat "productName" + "quantity" as items in that box.
 *  - We do a naive approach: each row -> create or update objects in localStorage.
 */

/**
 * Get the array of existing objects from localStorage
 */
function getObjectsFromStorage() {
  const str = localStorage.getItem("objects");
  if (str) {
    return JSON.parse(str);
  }
  return [];
}

/**
 * Save the array of objects to localStorage
 */
function setObjectsToStorage(objs) {
  localStorage.setItem("objects", JSON.stringify(objs));
}

/**
 * Generate a unique ID (timestamp-based)
 */
function generateId() {
  return Date.now();
}

/*******************************************************
 * Main logic for the "Products Table"
 *******************************************************/

/**
 * We'll keep an in-memory array of rows, e.g.:
 * [
 *   { productName: "", cellIndex: "", organizerName: "", boxName: "", quantity: "" },
 *   ...
 * ]
 *
 * But for minimal example, we can just handle everything directly in the DOM.
 */

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#products-table tbody");
  const addRowBtn = document.getElementById("add-row-btn");

  addRowBtn.addEventListener("click", () => {
    addNewRow(tableBody);
  });

  // Load existing objects and display them in the table
  loadObjectsToTable(tableBody);
});

function loadObjectsToTable(tbody) {
  const objects = getObjectsFromStorage();

  objects.forEach(obj => {
    const tr = createTableRow(obj);
    tbody.appendChild(tr);
  });
}

function createTableRow(obj) {
  const tr = document.createElement("tr");

  const productNameTd = document.createElement("td");
  productNameTd.textContent = obj.purpose || obj.tableNumber || "Unknown";
  tr.appendChild(productNameTd);

  const cellIndexTd = document.createElement("td");
  cellIndexTd.textContent = obj.cells ? obj.cells.length : "";
  tr.appendChild(cellIndexTd);

  const quantityTd = document.createElement("td");
  quantityTd.textContent = obj.items || obj.boxCount || obj.organizerCount || 0;
  tr.appendChild(quantityTd);

  const colorTd = document.createElement("td");
  colorTd.style.backgroundColor = obj.color || "#ffffff";
  tr.appendChild(colorTd);

  const typeTd = document.createElement("td");
  const typeIndicator = document.createElement("span");
  typeIndicator.classList.add("type-indicator");
  if (obj.type === "organizer") {
    typeIndicator.classList.add("organizer");
    typeIndicator.textContent = "Organizer";
  } else if (obj.type === "box") {
    typeIndicator.classList.add("box");
    typeIndicator.textContent = "Box";
  }
  typeTd.appendChild(typeIndicator);
  tr.appendChild(typeTd);

  const actionsTd = document.createElement("td");
  actionsTd.classList.add("actions");

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => editRow(tr, obj.id));
  actionsTd.appendChild(editBtn);

  const duplicateBtn = document.createElement("button");
  duplicateBtn.textContent = "Duplicate";
  duplicateBtn.addEventListener("click", () => duplicateRow(obj.id));
  actionsTd.appendChild(duplicateBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteRow(tr, obj.id));
  actionsTd.appendChild(deleteBtn);

  tr.appendChild(actionsTd);
  return tr;
}

/**
 * Add a new row to the table
 */
function addNewRow(tbody) {
  const tr = createEditableRow();
  tbody.appendChild(tr);
}

function createEditableRow(obj = {}) {
  const tr = document.createElement("tr");

  const columns = ["productName", "cellIndex", "quantity", "color"];
  columns.forEach((col) => {
    const td = document.createElement("td");
    const input = document.createElement(col === "color" ? "input" : "input");
    input.type = (col === "quantity" || col === "cellIndex") ? "number" : (col === "color" ? "color" : "text");
    input.min = "0";
    input.value = obj[col] || (col === "color" ? "#ffffff" : ""); // Заполнение поля текущим значением

    input.addEventListener("change", () => {
      syncRowToObjects(tr);
    });

    td.appendChild(input);
    tr.appendChild(td);
  });

  const typeTd = document.createElement("td");
  const typeIndicator = document.createElement("span");
  typeIndicator.classList.add("type-indicator");
  if (obj.type === "organizer") {
    typeIndicator.classList.add("organizer");
    typeIndicator.textContent = "Organizer";
  } else if (obj.type === "box") {
    typeIndicator.classList.add("box");
    typeIndicator.textContent = "Box";
  }
  typeTd.appendChild(typeIndicator);
  tr.appendChild(typeTd);

  const actionsTd = document.createElement("td");
  actionsTd.classList.add("actions");

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => saveRow(tr, obj.id));
  actionsTd.appendChild(saveBtn);

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => cancelEdit(tr, obj));
  actionsTd.appendChild(cancelBtn);

  tr.appendChild(actionsTd);
  return tr;
}

function editRow(tr, id) {
  const obj = getObjectsFromStorage().find(o => o.id === id);
  const newTr = createEditableRow({
    productName: obj.purpose || obj.tableNumber || "",
    cellIndex: obj.cells ? obj.cells.length : "",
    quantity: obj.items || obj.boxCount || obj.organizerCount || 0,
    color: obj.color || "#ffffff",
    type: obj.type
  });
  tr.replaceWith(newTr);
}

function saveRow(tr, id) {
  const tds = tr.querySelectorAll("td");
  const productName = tds[0].querySelector("input").value.trim();
  const cellIndexStr = tds[1].querySelector("input").value.trim();
  const quantityStr = tds[2].querySelector("input").value.trim();
  const color = tds[3].querySelector("input").value;

  const quantity = parseInt(quantityStr, 10) || 0;
  const cellIndex = parseInt(cellIndexStr, 10);

  let objects = getObjectsFromStorage();

  let obj = objects.find(o => o.id === id);
  if (!obj) {
    obj = { id: generateId(), type: "", purpose: "", cells: [], items: 0, color: "#ffffff" };
    objects.push(obj);
  }

  obj.purpose = productName;
  obj.items = quantity;
  obj.color = color;

  if (!isNaN(cellIndex) && cellIndex > 0) {
    obj.type = "organizer";
    obj.cells = Array.from({ length: cellIndex }, (_, i) => ({ cellIndex: i + 1, productName: "", quantity: 0 }));
  } else {
    obj.type = "box";
    obj.cells = [];
  }

  setObjectsToStorage(objects);
  location.reload();
}

function cancelEdit(tr, obj) {
  const newTr = createTableRow(obj);
  tr.replaceWith(newTr);
}

function duplicateRow(id) {
  const objects = getObjectsFromStorage();
  const obj = objects.find(o => o.id === id);
  if (!obj) return;

  const newObj = { ...obj, id: generateId() };
  objects.push(newObj);
  setObjectsToStorage(objects);
  location.reload();
}

function deleteRow(tr, id) {
  tr.remove();
  let objects = getObjectsFromStorage();
  objects = objects.filter(o => o.id !== id);
  setObjectsToStorage(objects);
}

/**
 * Sync a single row to the "objects" in localStorage
 * Called whenever user changes something in that row.
 */
function syncRowToObjects(tr) {
  const tds = tr.querySelectorAll("td");
  const productName = tds[0].querySelector("input").value.trim();
  const cellIndexStr = tds[1].querySelector("input").value.trim();
  const quantityStr = tds[2].querySelector("input").value.trim();
  const color = tds[3].querySelector("input").value;

  const quantity = parseInt(quantityStr, 10) || 0;
  const cellIndex = parseInt(cellIndexStr, 10);

  let objects = getObjectsFromStorage();

  let obj = objects.find(o => o.id === tr.dataset.id);
  if (!obj) {
    obj = { id: generateId(), type: "", purpose: "", cells: [], items: 0, color: "#ffffff" };
    objects.push(obj);
  }

  obj.purpose = productName;
  obj.items = quantity;
  obj.color = color;

  if (!isNaN(cellIndex) && cellIndex > 0) {
    obj.type = "organizer";
    obj.cells = Array.from({ length: cellIndex }, (_, i) => ({ cellIndex: i + 1, productName: "", quantity: 0 }));
  } else {
    obj.type = "box";
    obj.cells = [];
  }

  setObjectsToStorage(objects);
}

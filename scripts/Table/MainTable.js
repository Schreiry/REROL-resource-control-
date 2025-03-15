/*******************************************************
 * Global / Helper
 *******************************************************/

/**
 * localStorage["objects"] предполагается структурой из главной страницы:
 *   Box:       { id, type: "box", color, purpose, capacity, items }
 *   Organizer: { id, type: "organizer", color, purpose, cells: [...] }
 *   Table:     { id, type: "table", orientation, tableNumber, boxCount, organizerCount }
 *
 * На этой странице (Products Table) мы отображаем/редактируем 5 колонок:
 *   1) productName
 *   2) cellIndex
 *   3) quantity
 *   4) color
 *   5) type
 *
 *   + actions (Edit / Duplicate / Delete)
 *
 * "productName" => для Box/Organizer часто это obj.purpose.
 * "cellIndex"   => для Organizer можно хранить obj.cells.length (упрощённо).
 * "quantity"    => для Box => obj.items, Organizer => суммарно? (упростим),
 *                  Table => obj.boxCount + obj.organizerCount? (или 0).
 * "color"       => obj.color
 * "type"        => "box" / "organizer" / "table"
 */

/*******************************************************
 * Storage getters/setters
 *******************************************************/
function getObjectsFromStorage() {
  try {
    const str = localStorage.getItem("objects");
    if (!str) return [];
    const parsed = JSON.parse(str);
    if (!Array.isArray(parsed)) {
      console.warn("[getObjectsFromStorage] Data in localStorage is not an array. Resetting.");
      return [];
    }
    return parsed;
  } catch (err) {
    console.error("[getObjectsFromStorage] Error parsing localStorage:", err);
    return [];
  }
}

function setObjectsToStorage(objects) {
  if (!Array.isArray(objects)) {
    console.error("[setObjectsToStorage] objects is not an array!", objects);
    return;
  }
  try {
    localStorage.setItem("objects", JSON.stringify(objects));
  } catch (err) {
    console.error("[setObjectsToStorage] Error saving to localStorage:", err);
  }
}

function generateId() {
  return Date.now();
}

/*******************************************************
 * On DOMContentLoaded
 *******************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#products-table tbody");
  const addRowBtn = document.getElementById("add-row-btn");

  if (!tableBody || !addRowBtn) {
    console.error("Missing tableBody or addRowBtn elements.");
    return;
  }

  // Add new empty row
  addRowBtn.addEventListener("click", () => {
    console.log("[addRowBtn] Adding new empty row...");
    addEmptyRow(tableBody);
  });

  // Load existing objects from localStorage
  loadObjectsToTable(tableBody);
});

/*******************************************************
 * Loading objects => creating rows
 *******************************************************/
function loadObjectsToTable(tbody) {
  const objects = getObjectsFromStorage();
  console.log("[loadObjectsToTable] Loaded objects:", objects);

  objects.forEach(obj => {
    const row = createDisplayRowFromObject(obj);
    tbody.appendChild(row);
  });
}

/**
 * Convert an object from localStorage to a display row (not editing)
 */
function createDisplayRowFromObject(obj) {
  // Prepare default values
  let productName = "";
  let cellIndex = "";
  let quantity = 0;
  let color = obj.color || "#ffffff";
  let type = obj.type || "box"; // default if unknown

  // Fill fields depending on type
  if (type === "box") {
    productName = obj.purpose || "Box";
    quantity = obj.items || 0;
    // cellIndex stays empty
  } else if (type === "organizer") {
    productName = obj.purpose || "Organizer";
    cellIndex = obj.cells ? obj.cells.length : 0;
    // quantity could be sum of all cells? We'll keep it 0 or do advanced
    quantity = obj.items || 0; // or sum of cell quantities
  } else if (type === "table") {
    productName = obj.tableNumber || "Table";
    quantity = (obj.boxCount || 0) + (obj.organizerCount || 0);
    // cellIndex can be empty
  } else {
    console.warn("[createDisplayRowFromObject] Unknown type:", type);
  }

  // Create <tr>
  const tr = document.createElement("tr");
  // Store object's ID for future reference
  tr.dataset.id = obj.id;

  // productName (td #1)
  const tdProduct = document.createElement("td");
  tdProduct.textContent = productName;
  tr.appendChild(tdProduct);

  // cellIndex (td #2)
  const tdCellIndex = document.createElement("td");
  tdCellIndex.textContent = cellIndex;
  tr.appendChild(tdCellIndex);

  // quantity (td #3)
  const tdQuantity = document.createElement("td");
  tdQuantity.textContent = quantity;
  tr.appendChild(tdQuantity);

  // color (td #4)
  const tdColor = document.createElement("td");
  tdColor.style.backgroundColor = color;
  tdColor.textContent = color; // or just show hex
  tr.appendChild(tdColor);

  // type (td #5)
  const tdType = document.createElement("td");
  const typeSpan = document.createElement("span");
  typeSpan.classList.add("type-indicator");
  typeSpan.textContent = type.charAt(0).toUpperCase() + type.slice(1); // "Box", "Organizer", "Table"
  if (type === "organizer") {
    typeSpan.classList.add("organizer");
  } else if (type === "box") {
    typeSpan.classList.add("box");
  } // can add for table as well
  tdType.appendChild(typeSpan);
  tr.appendChild(tdType);

  // actions (td #6)
  const tdActions = document.createElement("td");
  tdActions.classList.add("actions");

  // Edit
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => {
    console.log("[Edit] row => switching to edit mode for object ID:", obj.id);
    switchToEditMode(tr);
  });
  tdActions.appendChild(editBtn);

  // Duplicate
  const duplicateBtn = document.createElement("button");
  duplicateBtn.textContent = "Duplicate";
  duplicateBtn.addEventListener("click", () => {
    console.log("[Duplicate] object ID:", obj.id);
    duplicateObject(obj.id);
  });
  tdActions.appendChild(duplicateBtn);

  // Delete
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    console.log("[Delete] object ID:", obj.id);
    deleteObjectRow(tr);
  });
  tdActions.appendChild(deleteBtn);

  tr.appendChild(tdActions);
  return tr;
}

/*******************************************************
 * Adding a brand new row in "edit" mode
 *******************************************************/
function addEmptyRow(tbody) {
  const newTr = createEditRow({
    id: null,
    productName: "",
    cellIndex: "",
    quantity: "",
    color: "#ffffff",
    type: ""
  });
  tbody.appendChild(newTr);
}

/*******************************************************
 * Switch existing row to "edit" mode
 *******************************************************/
function switchToEditMode(tr) {
  const id = parseInt(tr.dataset.id, 10);
  let obj = null;
  if (id) {
    const objects = getObjectsFromStorage();
    obj = objects.find(o => o.id === id);
  }

  // Prepare data for editing
  const data = {
    id: obj?.id || null,
    productName: "",
    cellIndex: "",
    quantity: "",
    color: obj?.color || "#ffffff",
    type: obj?.type || "box"
  };

  if (obj) {
    if (obj.type === "box") {
      data.productName = obj.purpose || "";
      data.quantity = obj.items?.toString() || "0";
      // cellIndex remains empty
    } else if (obj.type === "organizer") {
      data.productName = obj.purpose || "";
      data.cellIndex = obj.cells ? obj.cells.length.toString() : "";
      data.quantity = obj.items?.toString() || "0"; // or sum of cells
    } else if (obj.type === "table") {
      data.productName = obj.tableNumber || "";
      data.quantity = ((obj.boxCount || 0) + (obj.organizerCount || 0)).toString();
      // cellIndex empty
    }
  }

  const editTr = createEditRow(data);
  tr.replaceWith(editTr);
}

/*******************************************************
 * Create an "edit" row
 *******************************************************/
function createEditRow(data) {
  const tr = document.createElement("tr");
  if (data.id) {
    tr.dataset.id = data.id;
  }
  tr.dataset.isEditing = "true";

  // 1) productName
  tr.appendChild(createInputCell("text", data.productName));

  // 2) cellIndex
  tr.appendChild(createInputCell("number", data.cellIndex));

  // 3) quantity
  tr.appendChild(createInputCell("number", data.quantity));

  // 4) color
  tr.appendChild(createInputCell("color", data.color));

  // 5) type (read-only or select? Упростим: just text)
  const tdType = document.createElement("td");
  const typeSpan = document.createElement("span");
  typeSpan.classList.add("type-indicator");
  typeSpan.textContent = data.type ? data.type : "";
  tdType.appendChild(typeSpan);
  tr.appendChild(tdType);

  // 6) actions: Save / Cancel
  const tdActions = document.createElement("td");
  tdActions.classList.add("actions");

  // Save
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", () => {
    console.log("[Save] row changes...");
    saveRowChanges(tr);
  });
  tdActions.appendChild(saveBtn);

  // Cancel
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.addEventListener("click", () => {
    console.log("[Cancel] revert row...");
    if (data.id) {
      // revert to display mode
      const objects = getObjectsFromStorage();
      const obj = objects.find(o => o.id === data.id);
      if (obj) {
        const displayTr = createDisplayRowFromObject(obj);
        tr.replaceWith(displayTr);
        return;
      }
    }
    // if new row => just remove
    tr.remove();
  });
  tdActions.appendChild(cancelBtn);

  tr.appendChild(tdActions);
  return tr;
}

function createInputCell(inputType, value) {
  const td = document.createElement("td");
  const input = document.createElement("input");
  input.type = inputType;
  if (inputType === "number") {
    input.min = "0";
  }
  input.value = value || "";
  td.appendChild(input);
  return td;
}

/*******************************************************
 * Save row changes => update localStorage
 *******************************************************/
function saveRowChanges(tr) {
  // Extract inputs
  const tds = tr.querySelectorAll("td");
  if (tds.length < 6) {
    console.warn("[saveRowChanges] Not enough columns to read data.");
    return;
  }

  const productName = tds[0].querySelector("input").value.trim();
  const cellIndexStr = tds[1].querySelector("input").value.trim();
  const quantityStr = tds[2].querySelector("input").value.trim();
  const colorValue = tds[3].querySelector("input").value.trim();

  const cellIndex = parseInt(cellIndexStr, 10) || 0;
  const quantity = parseInt(quantityStr, 10) || 0;

  let id = tr.dataset.id ? parseInt(tr.dataset.id, 10) : null;
  let objects = getObjectsFromStorage();
  let obj = id ? objects.find(o => o.id === id) : null;

  // If object doesn't exist, create new
  if (!obj) {
    obj = { id: generateId(), type: "box", color: colorValue, purpose: "", items: 0, cells: [] };
    objects.push(obj);
    console.log("[saveRowChanges] Creating new object with ID:", obj.id);
  }

  // Update fields
  obj.color = colorValue;

  // Decide if it's "organizer" or "box" (table is not automatically created)
  if (cellIndex > 0) {
    // user wants an organizer
    obj.type = "organizer";
    obj.purpose = productName || "Organizer";
    // we can create that many cells
    obj.cells = [];
    for (let i = 0; i < cellIndex; i++) {
      obj.cells.push({ cellIndex: i+1, productName: "", quantity: 0 });
    }
    // quantity could be some aggregator or stored in obj.items
    obj.items = quantity;
  } else {
    // user wants a box
    obj.type = "box";
    obj.purpose = productName || "Box";
    obj.items = quantity;
    obj.cells = [];
  }

  // Save
  setObjectsToStorage(objects);

  // Switch row to display mode
  const newDisplayRow = createDisplayRowFromObject(obj);
  tr.replaceWith(newDisplayRow);
}

/*******************************************************
 * Duplicate / Delete
 *******************************************************/
function duplicateObject(id) {
  if (!id) return;
  let objects = getObjectsFromStorage();
  const obj = objects.find(o => o.id === id);
  if (!obj) {
    console.warn("[duplicateObject] Object not found, ID:", id);
    return;
  }
  const newObj = JSON.parse(JSON.stringify(obj));
  newObj.id = generateId();
  objects.push(newObj);
  setObjectsToStorage(objects);
  console.log("[duplicateObject] Duplicated object, new ID:", newObj.id);
  location.reload();
}

function deleteObjectRow(tr) {
  const id = parseInt(tr.dataset.id, 10);
  if (!id) {
    console.warn("[deleteObjectRow] No ID found in row dataset.");
    tr.remove();
    return;
  }
  let objects = getObjectsFromStorage();
  const index = objects.findIndex(o => o.id === id);
  if (index === -1) {
    console.warn("[deleteObjectRow] Object not found, ID:", id);
    tr.remove();
    return;
  }
  objects.splice(index, 1);
  setObjectsToStorage(objects);
  console.log("[deleteObjectRow] Deleted object with ID:", id);
  tr.remove();
}

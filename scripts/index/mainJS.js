/*******************************************************
 |                 Global variables                     |
 *******************************************************/

// Store in memory the current user (after login)
let currentUser = null;

// "Blockchain"-like log (array of blocks).
// Each block: { index, timestamp, user, action, data, previousHash, hash }
let blockchain = [];

/**
 * Helper function for generating a simple hash
 */
function simpleHash(input) {
  return btoa(unescape(encodeURIComponent(input))).slice(0, 16);
}

/**
 * Generate a new block in the "blockchain"
 */
function createBlock(user, action, data) {
  const timestamp = new Date().toISOString();
  const index = blockchain.length;
  const previousHash = (blockchain.length === 0) ? "0" : blockchain[blockchain.length - 1].hash;
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

  // Add to the chain
  blockchain.push(block);

  // Save in localStorage
  localStorage.setItem("blockchainLog", JSON.stringify(blockchain));
}

/**
 * Restore the blockchain from localStorage if it is there
 */
function loadBlockchain() {
  const stored = localStorage.getItem("blockchainLog");
  if (stored) {
    blockchain = JSON.parse(stored);
  } else {
    blockchain = [];
  }
}

/**
 * Store users in localStorage
 */
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

/**
 * Save objects (boxes, organizers, tables) in localStorage
 */
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

// Load data on startup
loadBlockchain();

/*******************************************************
 * Registration / Login / Logout
 *******************************************************/
function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}
function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

function registerUser() {
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;
  if (!username || !password) {
    alert("Please enter your username and password.");
    return;
  }

  const users = getUsersFromStorage();
  if (users.some(u => u.username === username)) {
    alert("A user with this name already exists!");
    return;
  }
  users.push({ username, password });
  setUsersToStorage(users);

  createBlock(username, "REGISTER", { username });
  alert("Registration successful!");
  closeModal("register-modal");
}

function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;
  if (!username || !password) {
    alert("Please enter your username and password.");
    return;
  }

  const users = getUsersFromStorage();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user.username;
    createBlock(currentUser, "LOGIN", { username: currentUser });

    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
    document.getElementById("export-log-section").classList.remove("hidden");

    document.getElementById("current-user").textContent = "User: " + currentUser;

    // Remove the hidden class from the header menu
    document.querySelector(".header-menu").classList.remove("hidden");

    closeModal("login-modal");
  } else {
    alert("Incorrect username or password!");
  }
}

function logoutUser() {
  if (currentUser) {
    createBlock(currentUser, "LOGOUT", { username: currentUser });
  }
  currentUser = null;

  document.getElementById("auth-section").classList.remove("hidden");
  document.getElementById("main-content").classList.add("hidden");
  document.getElementById("export-log-section").classList.add("hidden");

  // Add the hidden class back to the header menu
  document.querySelector(".header-menu").classList.add("hidden");
}

/*******************************************************
 * Create new objects
 *******************************************************/
function showCreateObjectModal() {
  // Reset fields
  document.getElementById("object-type").value = "";

  // Box
  document.getElementById("box-color").value = "#ffff00";
  document.getElementById("box-purpose").value = "";
  document.getElementById("box-capacity").value = 100;
  document.getElementById("box-items").value = 0;

  // Organizer
  document.getElementById("organizer-purpose").value = "";
  document.getElementById("organizer-color").value = "#ff0000";
  document.getElementById("organizer-cells").value = 10;

  // Table
  document.getElementById("table-orientation").value = "north";
  document.getElementById("table-number").value = "";
  document.getElementById("table-box-count").value = 0;
  document.getElementById("table-organizer-count").value = 0;

  // Hide param sections
  document.getElementById("box-params").classList.add("hidden");
  document.getElementById("organizer-params").classList.add("hidden");
  document.getElementById("table-params").classList.add("hidden");

  openModal("create-object-modal");
}

function onObjectTypeChange() {
  const type = document.getElementById("object-type").value;
  document.getElementById("box-params").classList.add("hidden");
  document.getElementById("organizer-params").classList.add("hidden");
  document.getElementById("table-params").classList.add("hidden");

  if (type === "box") {
    document.getElementById("box-params").classList.remove("hidden");
  } else if (type === "organizer") {
    document.getElementById("organizer-params").classList.remove("hidden");
  } else if (type === "table") {
    document.getElementById("table-params").classList.remove("hidden");
  }
}

function createObject() {
  const type = document.getElementById("object-type").value;
  if (!type) {
    alert("Select object type!");
    return;
  }

  const objects = getObjectsFromStorage();
  let newObject = null;

  if (type === "box") {
    const color = document.getElementById("box-color").value;
    const purpose = document.getElementById("box-purpose").value.trim();
    const capacity = parseInt(document.getElementById("box-capacity").value, 10);
    const items = parseInt(document.getElementById("box-items").value, 10);

    newObject = {
      id: Date.now(),
      type: "box",
      color,
      purpose,
      capacity,
      items
    };
    objects.push(newObject);
    setObjectsToStorage(objects);
    createBlock(currentUser, "CREATE_BOX", newObject);

  } else if (type === "organizer") {
    const purpose = document.getElementById("organizer-purpose").value.trim();
    const color = document.getElementById("organizer-color").value;
    const cellsCount = parseInt(document.getElementById("organizer-cells").value, 10);

    const cells = [];
    for (let i = 0; i < cellsCount; i++) {
      cells.push({ cellIndex: i, productName: "", quantity: 0 });
    }

    newObject = {
      id: Date.now(),
      type: "organizer",
      color,
      purpose,
      cells
    };
    objects.push(newObject);
    setObjectsToStorage(objects);
    createBlock(currentUser, "CREATE_ORGANIZER", newObject);

  } else if (type === "table") {
    const orientation = document.getElementById("table-orientation").value;
    const tableNumber = document.getElementById("table-number").value.trim();
    const boxCount = parseInt(document.getElementById("table-box-count").value, 10);
    const organizerCount = parseInt(document.getElementById("table-organizer-count").value, 10);

    newObject = {
      id: Date.now(),
      type: "table",
      orientation,
      tableNumber,
      boxCount,
      organizerCount
    };
    objects.push(newObject);
    setObjectsToStorage(objects);
    createBlock(currentUser, "CREATE_TABLE", newObject);
  }

  // Broadcast the new object to other tabs
  broadcastDataUpdate(newObject);

  closeModal("create-object-modal");
  renderObjects();
}

/*******************************************************
 * Render objects
 *******************************************************/
function renderObjects(resources) {
  const container = document.getElementById("objects-container");
  container.innerHTML = "";

  resources.forEach(resource => {
    const card = document.createElement("div");
    card.classList.add("object-card");

    const name = document.createElement("h3");
    name.textContent = resource.name;
    card.appendChild(name);

    if (resource.photo) {
      const img = document.createElement("img");
      img.src = resource.photo;
      img.alt = resource.name;
      img.style.maxWidth = "100px";
      card.appendChild(img);
    }

    const description = document.createElement("p");
    description.textContent = resource.description || "No description available.";
    card.appendChild(description);

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("object-actions");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditModal(resource.id));
    actionsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteResource(resource.id));
    actionsDiv.appendChild(deleteBtn);

    card.appendChild(actionsDiv);
    container.appendChild(card);
  });
}

/*******************************************************
 * Table editing (user wants to change table parameters)
 *******************************************************/
function openTableModal(tableId) {
  const objects = getObjectsFromStorage();
  const tableObj = objects.find(o => o.id === tableId);
  if (!tableObj) return;

  document.getElementById("edit-table-id").textContent = tableObj.id;
  document.getElementById("edit-table-orientation").value = tableObj.orientation;
  document.getElementById("edit-table-number").value = tableObj.tableNumber;
  document.getElementById("edit-table-box-count").value = tableObj.boxCount;
  document.getElementById("edit-table-organizer-count").value = tableObj.organizerCount;

  const modal = document.getElementById("table-modal");
  modal.setAttribute("data-table-id", tableId);
  modal.classList.remove("hidden");
}

function saveTableChanges() {
  const modal = document.getElementById("table-modal");
  const tableId = parseInt(modal.getAttribute("data-table-id"), 10);

  const orientation = document.getElementById("edit-table-orientation").value;
  const tableNumber = document.getElementById("edit-table-number").value.trim();
  const boxCount = parseInt(document.getElementById("edit-table-box-count").value, 10);
  const organizerCount = parseInt(document.getElementById("edit-table-organizer-count").value, 10);

  const objects = getObjectsFromStorage();
  const tableObj = objects.find(o => o.id === tableId);
  if (!tableObj) return;

  tableObj.orientation = orientation;
  tableObj.tableNumber = tableNumber;
  tableObj.boxCount = boxCount;
  tableObj.organizerCount = organizerCount;

  setObjectsToStorage(objects);
  createBlock(currentUser, "UPDATE_TABLE", {
    tableId,
    orientation,
    tableNumber,
    boxCount,
    organizerCount
  });

  modal.classList.add("hidden");
  renderObjects();
}

/*******************************************************
 * Organizer cell editing
 *******************************************************/
function openCellModal(organizerId, cellIndex) {
  const cellModal = document.getElementById("cell-modal");
  cellModal.setAttribute("data-organizer-id", organizerId);
  cellModal.setAttribute("data-cell-index", cellIndex);

  const objects = getObjectsFromStorage();
  const organizer = objects.find(o => o.id === organizerId);
  if (!organizer) return;

  const cellData = organizer.cells.find(c => c.cellIndex === cellIndex);
  if (!cellData) return;

  document.getElementById("cell-number").textContent = cellIndex;
  document.getElementById("cell-product").value = cellData.productName;
  document.getElementById("cell-quantity").value = cellData.quantity;

  openModal("cell-modal");
}

function saveCellChanges() {
  const cellModal = document.getElementById("cell-modal");
  const organizerId = parseInt(cellModal.getAttribute("data-organizer-id"), 10);
  const cellIndex = parseInt(cellModal.getAttribute("data-cell-index"), 10);

  const productName = document.getElementById("cell-product").value.trim();
  const quantity = parseInt(document.getElementById("cell-quantity").value, 10);

  const objects = getObjectsFromStorage();
  const organizer = objects.find(o => o.id === organizerId);
  if (!organizer) return;

  const cellData = organizer.cells.find(c => c.cellIndex === cellIndex);
  if (!cellData) return;

  cellData.productName = productName;
  cellData.quantity = quantity;

  setObjectsToStorage(objects);
  createBlock(currentUser, "UPDATE_CELL", { organizerId, cellIndex, productName, quantity });

  closeModal("cell-modal");
  renderObjects();
}
function changeCellQuantity(delta) {
  const input = document.getElementById("cell-quantity");
  let value = parseInt(input.value, 10);
  value += delta;
  if (value < 0) value = 0;
  input.value = value;
}

/*******************************************************
 * Edit an existing object (new feature)
 *******************************************************/
let editObjectId = null; // to store which object we are editing

function openEditObjectModal(objectId) {
  editObjectId = objectId;
  const objects = getObjectsFromStorage();
  const obj = objects.find(o => o.id === objectId);
  if (!obj) return;

  // Show the modal
  const modal = document.getElementById("edit-object-modal");
  modal.classList.remove("hidden");

  // Hide all param sections
  document.getElementById("edit-box-params").classList.add("hidden");
  document.getElementById("edit-organizer-params").classList.add("hidden");
  document.getElementById("edit-table-params").classList.add("hidden");

  // Fill common fields
  const typeSelect = document.getElementById("edit-object-type");
  typeSelect.value = obj.type;
  typeSelect.disabled = true; // can't change type

  if (obj.type === "box") {
    document.getElementById("edit-box-params").classList.remove("hidden");
    document.getElementById("edit-box-color").value = obj.color;
    document.getElementById("edit-box-purpose").value = obj.purpose;
    document.getElementById("edit-box-capacity").value = obj.capacity;
    document.getElementById("edit-box-items").value = obj.items;

  } else if (obj.type === "organizer") {
    document.getElementById("edit-organizer-params").classList.remove("hidden");
    document.getElementById("edit-organizer-purpose").value = obj.purpose;
    document.getElementById("edit-organizer-color").value = obj.color;
    document.getElementById("edit-organizer-cells").value = obj.cells.length;

  } else if (obj.type === "table") {
    document.getElementById("edit-table-params").classList.remove("hidden");
    document.getElementById("edit-table-orientation2").value = obj.orientation;
    document.getElementById("edit-table-number2").value = obj.tableNumber;
    document.getElementById("edit-table-box-count2").value = obj.boxCount;
    document.getElementById("edit-table-organizer-count2").value = obj.organizerCount;
  }
}

function saveEditedObject() {
  if (!editObjectId) return;

  const objects = getObjectsFromStorage();
  const obj = objects.find(o => o.id === editObjectId);
  if (!obj) return;

  if (obj.type === "box") {
    obj.color = document.getElementById("edit-box-color").value;
    obj.purpose = document.getElementById("edit-box-purpose").value.trim();
    obj.capacity = parseInt(document.getElementById("edit-box-capacity").value, 10);
    obj.items = parseInt(document.getElementById("edit-box-items").value, 10);

    createBlock(currentUser, "UPDATE_BOX", {
      id: obj.id, color: obj.color, purpose: obj.purpose, capacity: obj.capacity, items: obj.items
    });

  } else if (obj.type === "organizer") {
    obj.purpose = document.getElementById("edit-organizer-purpose").value.trim();
    obj.color = document.getElementById("edit-organizer-color").value;
    const newCellsCount = parseInt(document.getElementById("edit-organizer-cells").value, 10);

    // If user changed cells count, we can either do nothing or adjust array
    if (newCellsCount > obj.cells.length) {
      // add extra cells
      for (let i = obj.cells.length; i < newCellsCount; i++) {
        obj.cells.push({ cellIndex: i, productName: "", quantity: 0 });
      }
    } else if (newCellsCount < obj.cells.length) {
      // user is shrinking? We'll keep it simple and just slice
      obj.cells = obj.cells.slice(0, newCellsCount);
    }

    createBlock(currentUser, "UPDATE_ORGANIZER", {
      id: obj.id, purpose: obj.purpose, color: obj.color, cellsCount: obj.cells.length
    });

  } else if (obj.type === "table") {
    obj.orientation = document.getElementById("edit-table-orientation2").value;
    obj.tableNumber = document.getElementById("edit-table-number2").value.trim();
    obj.boxCount = parseInt(document.getElementById("edit-table-box-count2").value, 10);
    obj.organizerCount = parseInt(document.getElementById("edit-table-organizer-count2").value, 10);

    createBlock(currentUser, "UPDATE_TABLE", {
      id: obj.id, orientation: obj.orientation, tableNumber: obj.tableNumber,
      boxCount: obj.boxCount, organizerCount: obj.organizerCount
    });
  }

  setObjectsToStorage(objects);

  // Close edit modal
  document.getElementById("edit-object-modal").classList.add("hidden");
  editObjectId = null;

  // Re-render
  renderObjects();
}

/*******************************************************
 * Duplicate / Delete
 *******************************************************/
function duplicateObject(id) {
  const objects = getObjectsFromStorage();
  const obj = objects.find(o => o.id === id);
  if (!obj) return;

  const newObj = JSON.parse(JSON.stringify(obj));
  newObj.id = Date.now();

  objects.push(newObj);
  setObjectsToStorage(objects);

  createBlock(currentUser, "DUPLICATE_OBJECT", { originalId: id, newId: newObj.id });
  renderObjects();
}

function deleteObjectWithAnimation(id, cardElement) {
  const clone = cardElement.cloneNode(true);
  const rect = cardElement.getBoundingClientRect();

  clone.style.position = "absolute";
  clone.style.top = rect.top + "px";
  clone.style.left = rect.left + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";
  clone.style.transition = "transform 0.8s ease-in-out, opacity 0.8s ease-in-out";
  clone.style.zIndex = 1000;

  document.body.appendChild(clone);
  cardElement.remove();

  const trashRect = document.getElementById("trash-can").getBoundingClientRect();
  const targetX = trashRect.left + trashRect.width / 2 - (rect.left + rect.width / 2);
  const targetY = trashRect.top + trashRect.height / 2 - (rect.top + rect.height / 2);

  requestAnimationFrame(() => {
    clone.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.1)`;
    clone.style.opacity = "0";
  });

  clone.addEventListener("transitionend", () => {
    clone.remove();

    const objects = getObjectsFromStorage();
    const index = objects.findIndex(o => o.id === id);
    if (index !== -1) {
      objects.splice(index, 1);
      setObjectsToStorage(objects);

      createBlock(currentUser, "DELETE_OBJECT", { deletedId: id });
    }
    renderObjects();
  }, { once: true });
}

/*******************************************************
 * Export log
 *******************************************************/
function exportLog() {
  let logText = "Index | Timestamp           | User        | Action            | Data\n";
  logText += "-------------------------------------------------------------------------\n";
  blockchain.forEach(block => {
    logText += `${block.index} | ${block.timestamp} | ${block.user} | ${block.action} | ${JSON.stringify(block.data)}\n`;
  });

  const blob = new Blob([logText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "log.txt";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/*******************************************************
 * Attach event listeners on page load
 *******************************************************/
window.addEventListener("DOMContentLoaded", async () => {
  loadBlockchain();

  document.getElementById("register-btn").addEventListener("click", () => openModal("register-modal"));
  document.getElementById("login-btn").addEventListener("click", () => openModal("login-modal"));
  document.getElementById("add-object-btn").addEventListener("click", showCreateObjectModal);

  // close modals
  document.querySelectorAll(".close").forEach(closeBtn => {
    closeBtn.addEventListener("click", (e) => {
      const modalId = e.target.getAttribute("data-close");
      closeModal(modalId);
    });
  });

  document.getElementById("submit-register").addEventListener("click", registerUser);
  document.getElementById("submit-login").addEventListener("click", loginUser);
  document.getElementById("logout-btn").addEventListener("click", logoutUser);

  document.getElementById("object-type").addEventListener("change", onObjectTypeChange);
  document.getElementById("create-object-confirm").addEventListener("click", createObject);

  document.getElementById("cell-quantity-minus").addEventListener("click", () => changeCellQuantity(-1));
  document.getElementById("cell-quantity-plus").addEventListener("click", () => changeCellQuantity(1));
  document.getElementById("cell-save-btn").addEventListener("click", saveCellChanges);

  document.getElementById("edit-table-save-btn").addEventListener("click", saveTableChanges);
  document.getElementById("edit-table-cancel-btn").addEventListener("click", () => {
    document.getElementById("table-modal").classList.add("hidden");
  });

  // Edit Object modal (new)
  document.getElementById("edit-object-save-btn").addEventListener("click", saveEditedObject);

  document.getElementById("export-log-btn").addEventListener("click", exportLog);

  await syncResources();
});

/*******************************************************
 * Broadcast Channel for data updates
 *******************************************************/
const channel = new BroadcastChannel('data_channel');

// Listen for messages from other tabs
channel.onmessage = (event) => {
  const { type, data } = event.data;
  if (type === 'update') {
    // Handle the data update
    updateData(data);
  }
};

// Function to send data updates to other tabs
function broadcastDataUpdate(data) {
  channel.postMessage({ type: 'update', data });
}

// Function to update data on the current page
function updateData(data) {
  // Update your page with the new data
  console.log('Data received from another tab:', data);

  // Update local storage
  const objects = getObjectsFromStorage();
  const index = objects.findIndex(obj => obj.id === data.id);
  if (index !== -1) {
    objects[index] = data;
  } else {
    objects.push(data);
  }
  setObjectsToStorage(objects);

  // Re-render objects
  renderObjects();
}

// Синхронизация с базой данных из monfo.js
async function syncResources() {
  const activeResources = await db.resources.where('status').equals(RESOURCE_STATUS.ACTIVE).toArray();
  renderObjects(activeResources);
}

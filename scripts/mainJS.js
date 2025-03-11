
/*******************************************************
 |                 Global variables                      |
 *******************************************************/

// Store in memory the current user (after login)
let currentUser = null;

// "Blockchain"-like log (array of blocks).
// Each block: { index, timestamp, user, action, data, previousHash, hash }
let blockchain = [];

// Helper function for generating a simple hash
function simpleHash(input) {
// The easiest way is to hash via the built-in btoa or MD5/SHA1 libraries.
// Here we use btoa + some "mixture" in a simplified way.
  return btoa(unescape(encodeURIComponent(input))).slice(0, 16);
}

// Generate a new block in the "blockchain"
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

// Add to the chain
  blockchain.push(block);

// Save in localStorage
  localStorage.setItem("blockchainLog", JSON.stringify(blockchain));
}

// Restore the blockchain from localStorage if it is there
function loadBlockchain() {
  const stored = localStorage.getItem("blockchainLog");
  if (stored) {
    blockchain = JSON.parse(stored);
  } else {
    blockchain = [];
  }
}

// Store users in localStorage (easy way)
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

// Save objects (boxes, organizers) in localStorage
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
* Functions for registration/login/logout
 *******************************************************/

// Open a modal window
function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}

// Close the modal window
function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

// Registration
function registerUser() {
  const username = document.getElementById("reg-username").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!username || !password) {
    alert("Please enter your name and password.");
    return;
  }

  const users = getUsersFromStorage();
// Check if the name is taken
  if (users.some(u => u.username === username)) {
    alert("A user with this name already exists!");
    return;
  }

  // Создаём нового пользователя
  users.push({ username, password });
  setUsersToStorage(users);

  // Логируем событие
  createBlock(username, "REGISTER", { username });

  alert("Registration successful!");
  closeModal("register-modal");
}

// Вход
function loginUser() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    alert("Please enter your name and password.");
    return;
  }

  const users = getUsersFromStorage();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    currentUser = user.username;
// Log the event
    createBlock(currentUser, "LOGIN", { username: currentUser });

// Hide the authorization block, show the main content
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
    document.getElementById("export-log-section").classList.remove("hidden");

// Display the username
    document.getElementById("current-user").textContent = "Пользователь: " + currentUser;

    closeModal("login-modal");
  } else {
    alert("Incorrect username or password! Be careful. Have you forgotten?");
  }
}

// Exit
function logoutUser() {
  if (currentUser) {
    createBlock(currentUser, "LOGOUT", { username: currentUser });
  }
  currentUser = null;

// Show the authorization block again, hide the main content
  document.getElementById("auth-section").classList.remove("hidden");
  document.getElementById("main-content").classList.add("hidden");
  document.getElementById("export-log-section").classList.add("hidden");
}

/*******************************************************
Functions for creating and displaying objects
 *******************************************************/

// Show the form for creating an object
function showCreateObjectModal() {
// Reset fields
  document.getElementById("object-type").value = "";
  document.getElementById("box-color").value = "#ffff00";
  document.getElementById("box-purpose").value = "";
  document.getElementById("organizer-purpose").value = "";
  document.getElementById("organizer-color").value = "#ff0000";
  document.getElementById("organizer-cells").value = 10;

// Hide all parameters
  document.getElementById("box-params").classList.add("hidden");
  document.getElementById("organizer-params").classList.add("hidden");

  openModal("create-object-modal");
}

// Changing fields depending on the object type
function onObjectTypeChange() {
  const type = document.getElementById("object-type").value;
  if (type === "box") {
    document.getElementById("box-params").classList.remove("hidden");
    document.getElementById("organizer-params").classList.add("hidden");
  } else if (type === "organizer") {
    document.getElementById("box-params").classList.add("hidden");
    document.getElementById("organizer-params").classList.remove("hidden");
  } else {
// Nothing selected
    document.getElementById("box-params").classList.add("hidden");
    document.getElementById("organizer-params").classList.add("hidden");
  }
}

// Create an object (box or organizer)
function createObject() {
  const type = document.getElementById("object-type").value;
  if (!type) {
    alert("Select object type!");
    return;
  }

  const objects = getObjectsFromStorage();

  if (type === "box") {
    const color = document.getElementById("box-color").value;
    const purpose = document.getElementById("box-purpose").value.trim();

// Create a box object
    const newBox = {
      id: Date.now(), // уникальный id
      type: "box",
      color,
      purpose
    };

    objects.push(newBox);
    setObjectsToStorage(objects);

// Logging
    createBlock(currentUser, "CREATE_BOX", newBox);

  } else if (type === "organizer") {
    const purpose = document.getElementById("organizer-purpose").value.trim();
    const color = document.getElementById("organizer-color").value;
    const cellsCount = parseInt(document.getElementById("organizer-cells").value, 10);

// Form an array of cells
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

// Logging
    createBlock(currentUser, "CREATE_ORGANIZER", newOrganizer);
  }

  closeModal("create-object-modal");
  renderObjects();
}

// Render all objects on the main page
function renderObjects() {
  const container = document.getElementById("objects-container");
  container.innerHTML = "";

  const objects = getObjectsFromStorage();

  objects.forEach(obj => {
    const card = document.createElement("div");
    card.classList.add("object-card");

// If this is a box
    if (obj.type === "box") {
      card.style.backgroundColor = obj.color;
      const title = document.createElement("div");
      title.classList.add("object-title");
      title.textContent = obj.purpose || "Untitled (box)";
      card.appendChild(title);

// When clicking on the box: you can show the menu (if needed).
      card.addEventListener("click", () => {
        alert(`This box: ${obj.purpose}\nID: ${obj.id}`);
      });

    } 
// If this is an organizer
    else if (obj.type === "organizer") {
      card.style.borderColor = obj.color; // frame color - organizer color
      const title = document.createElement("div");
      title.classList.add("object-title");
      title.textContent = obj.purpose || "Untitled (organizer)";
      card.appendChild(title);

      // Блок ячеек
      const cellsWrapper = document.createElement("div");
      cellsWrapper.classList.add("organizer-cells");

      obj.cells.forEach(cell => {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("organizer-cell");
        cellDiv.textContent = cell.cellIndex; // Cell numbering

// When clicking on a cell, we open a modal editing window
        cellDiv.addEventListener("click", (e) => {
// Stop the popup so that the click doesn't trigger on the card
          e.stopPropagation();

// Add class "active" for animation
          cellDiv.classList.add("active");
          setTimeout(() => {
            cellDiv.classList.remove("active");
          }, 500);

          openCellModal(obj.id, cell.cellIndex);
        });

        cellsWrapper.appendChild(cellDiv);
      });

      card.appendChild(cellsWrapper);

// When clicking on the organizer card itself (not on the cells)
      card.addEventListener("click", () => {
        alert(`This is an organizer: ${obj.purpose}\nID: ${obj.id}\nNumber of cells: ${obj.cells.length}`);
      });
    }

// When clicking on the organizer card itself (not on the cells)
    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("object-actions");

    const duplicateBtn = document.createElement("button");
    duplicateBtn.textContent = "Duplicate";
    duplicateBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      duplicateObject(obj.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteObjectWithAnimation(obj.id, card);
    });

    actionsDiv.appendChild(duplicateBtn);
    actionsDiv.appendChild(deleteBtn);

    card.appendChild(actionsDiv);

    container.appendChild(card);
  });
}

/*******************************************************
* Functions for working with organizer cells
 *******************************************************/

// Open a modal window to edit a specific cell
function openCellModal(organizerId, cellIndex) {
// Store this data in temporary attributes
  const cellModal = document.getElementById("cell-modal");
  cellModal.setAttribute("data-organizer-id", organizerId);
  cellModal.setAttribute("data-cell-index", cellIndex);

// Find the cell itself in the data
  const objects = getObjectsFromStorage();
  const organizer = objects.find(o => o.id === organizerId);
  if (!organizer) return;

  const cellData = organizer.cells.find(c => c.cellIndex === cellIndex);

// Fill in the fields
  document.getElementById("cell-number").textContent = cellIndex;
  document.getElementById("cell-product").value = cellData.productName;
  document.getElementById("cell-quantity").value = cellData.quantity;

  openModal("cell-modal");
}

// Save changes by cell
function saveCellChanges() {
  const cellModal = document.getElementById("cell-modal");
  const organizerId = parseInt(cellModal.getAttribute("data-organizer-id"), 10);
  const cellIndex = parseInt(cellModal.getAttribute("data-cell-index"), 10);

  const productName = document.getElementById("cell-product").value.trim();
  const quantity = parseInt(document.getElementById("cell-quantity").value, 10);

// Find the organizer in the list
  const objects = getObjectsFromStorage();
  const organizer = objects.find(o => o.id === organizerId);
  if (!organizer) return;

  const cellData = organizer.cells.find(c => c.cellIndex === cellIndex);
  if (!cellData) return;

// Update
  cellData.productName = productName;
  cellData.quantity = quantity;

// Save
  setObjectsToStorage(objects);

// Logging
  createBlock(currentUser, "UPDATE_CELL", {
    organizerId,
    cellIndex,
    productName,
    quantity
  });

  closeModal("cell-modal");
  renderObjects();
}

// Decrease/increase quantity of product
function changeCellQuantity(delta) {
  const input = document.getElementById("cell-quantity");
  let value = parseInt(input.value, 10);
  value += delta;
  if (value < 0) value = 0; // we don't let it go into negative numbers
  input.value = value;
}

/*******************************************************
functions: duplication and deletion with animation
 *******************************************************/

// Duplicate the object
function duplicateObject(id) {
  const objects = getObjectsFromStorage();
  const obj = objects.find(o => o.id === id);
  if (!obj) return;

// Deep copy to avoid referencing the same array
  const newObj = JSON.parse(JSON.stringify(obj));
  // Генерируем новый ID
  newObj.id = Date.now();

// Add to the list
  objects.push(newObj);
  setObjectsToStorage(objects);

// Logging
  createBlock(currentUser, "DUPLICATE_OBJECT", { originalId: id, newId: newObj.id });

// Redraw
  renderObjects();
}

// Delete the object with a nice "fly away" animation to the trash
function deleteObjectWithAnimation(id, cardElement) {
  // 1) Clone the card
  const clone = cardElement.cloneNode(true);
  const rect = cardElement.getBoundingClientRect();
  
 // Position the clone in the same coordinates
  clone.style.position = "absolute";
  clone.style.top = rect.top + "px";
  clone.style.left = rect.left + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";
  clone.style.transition = "transform 0.8s ease-in-out, opacity 0.8s ease-in-out";
  clone.style.zIndex = 1000;

// Add clone to page
  document.body.appendChild(clone);

  // 2) Remove the original from the DOM immediately (so it doesn't get in the way)
  cardElement.remove();

  // 3) Calculate the coordinates of the basket (the center of the basket)
  const trashRect = document.getElementById("trash-can").getBoundingClientRect();
  const targetX = trashRect.left + trashRect.width / 2 - (rect.left + rect.width / 2);
  const targetY = trashRect.top + trashRect.height / 2 - (rect.top + rect.height / 2);

  // 4) Start the animation (via requestAnimationFrame)
  requestAnimationFrame(() => {
    clone.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.1)`;
    clone.style.opacity = "0";
  });

  // 5) When the animation is finished, delete the clone and the object itself from localStorage
  clone.addEventListener("transitionend", () => {
    clone.remove();

    // Remove from localStorage
    const objects = getObjectsFromStorage();
    const index = objects.findIndex(o => o.id === id);
    if (index !== -1) {
      objects.splice(index, 1);
      setObjectsToStorage(objects);

      // Logging
      createBlock(currentUser, "DELETE_OBJECT", { deletedId: id });
    }

    // Update the display
    renderObjects();
  }, { once: true });
}

/*******************************************************
* Log export functions
 *******************************************************/

// Upload log to text file
function exportLog() {
// Let's collect the contents of the log
  let logText = "Index | Timestamp           | User        | Action            | Data\n";
  logText += "-------------------------------------------------------------------------\n";
  blockchain.forEach(block => {
    logText += `${block.index} | ${block.timestamp} | ${block.user} | ${block.action} | ${JSON.stringify(block.data)}\n`;
  });

// Let's create a "file" on the fly
  const blob = new Blob([logText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

// Let's create a temporary link and click on it
  const a = document.createElement("a");
  a.href = url;
  a.download = "log.txt";
  document.body.appendChild(a);
  a.click();

// Remove the link
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


/*******************************************************
* Attach event listeners when the page loads
 *******************************************************/
window.addEventListener("DOMContentLoaded", () => {
// Buttons for opening modals
  document.getElementById("register-btn").addEventListener("click", () => openModal("register-modal"));
  document.getElementById("login-btn").addEventListener("click", () => openModal("login-modal"));
  document.getElementById("add-object-btn").addEventListener("click", showCreateObjectModal);

// Modal close buttons (crosses)
  document.querySelectorAll(".close").forEach(closeBtn => {
    closeBtn.addEventListener("click", (e) => {
      const modalId = e.target.getAttribute("data-close");
      closeModal(modalId);
    });
  });

// "Register" and "Login" buttons
  document.getElementById("submit-register").addEventListener("click", registerUser);
  document.getElementById("submit-login").addEventListener("click", loginUser);

// Exit button
  document.getElementById("logout-btn").addEventListener("click", logoutUser);

// Changing the object type in a modal window
  document.getElementById("object-type").addEventListener("change", onObjectTypeChange);

// "Create object" button
  document.getElementById("create-object-confirm").addEventListener("click", createObject);

// Cell modal window
  document.getElementById("cell-quantity-minus").addEventListener("click", () => changeCellQuantity(-1));
  document.getElementById("cell-quantity-plus").addEventListener("click", () => changeCellQuantity(1));
  document.getElementById("cell-save-btn").addEventListener("click", saveCellChanges);

// Log export button
  document.getElementById("export-log-btn").addEventListener("click", exportLog);

// When loading, we immediately render objects (if something has already been created)
  renderObjects();
});

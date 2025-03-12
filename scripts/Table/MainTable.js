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
  });
  
  /**
   * Add a new row to the table
   */
  function addNewRow(tbody) {
    // Create a <tr>
    const tr = document.createElement("tr");
  
    // We'll have 5 columns => 5 inputs
    const columns = ["productName", "cellIndex", "organizerName", "boxName", "quantity"];
    columns.forEach((col) => {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = (col === "quantity" || col === "cellIndex") ? "number" : "text";
      input.min = "0"; // for quantity or cellIndex
  
      // When the user changes a cell, we sync to localStorage
      input.addEventListener("change", () => {
        syncRowToObjects(tr);
      });
  
      td.appendChild(input);
      tr.appendChild(td);
    });
  
    tbody.appendChild(tr);
  }
  
  /**
   * Sync a single row to the "objects" in localStorage
   * Called whenever user changes something in that row.
   */
  function syncRowToObjects(tr) {
    // Extract values from inputs in the row
    const tds = tr.querySelectorAll("td");
    const productName = tds[0].querySelector("input").value.trim();
    const cellIndexStr = tds[1].querySelector("input").value.trim();
    const organizerName = tds[2].querySelector("input").value.trim();
    const boxName = tds[3].querySelector("input").value.trim();
    const quantityStr = tds[4].querySelector("input").value.trim();
  
    const quantity = parseInt(quantityStr, 10) || 0;
    const cellIndex = parseInt(cellIndexStr, 10);
  
    // We'll update localStorage
    let objects = getObjectsFromStorage();
  
    // 1) If "organizerName" is provided, let's create/find an organizer
    if (organizerName) {
      // Find existing organizer with the same name
      let organizerObj = objects.find(o => o.type === "organizer" && o.purpose === organizerName);
  
      if (!organizerObj) {
        // Create a new organizer
        organizerObj = {
          id: generateId(),
          type: "organizer",
          color: "#ff0000", // default color or random
          purpose: organizerName,
          cells: []
        };
        objects.push(organizerObj);
      }
  
      // If user provided a cellIndex, let's put productName + quantity there
      if (!isNaN(cellIndex)) {
        // find or create the cell
        let cell = organizerObj.cells.find(c => c.cellIndex === cellIndex);
        if (!cell) {
          cell = { cellIndex, productName: "", quantity: 0 };
          organizerObj.cells.push(cell);
        }
        // update
        cell.productName = productName;
        cell.quantity = quantity;
      }
    }
  
    // 2) If "boxName" is provided, let's create/find a box
    if (boxName) {
      let boxObj = objects.find(o => o.type === "box" && o.purpose === boxName);
      if (!boxObj) {
        boxObj = {
          id: generateId(),
          type: "box",
          color: "#ffff00", // default color
          purpose: boxName,
          capacity: 100,   // default capacity
          items: 0        // or if you want an array
        };
        objects.push(boxObj);
      }
  
      // We interpret "quantity" as how many of productName are in this box
      // For simplicity, let's just store total items as a number
      // Or we might do a more complex structure. We'll keep it simple:
      boxObj.items = quantity;
    }
  
    // 3) If neither "organizerName" nor "boxName" is filled, we do nothing
    //    Or we might interpret that as "just productName alone" is stored somewhere else.
    //    For now, let's ignore.
  
    setObjectsToStorage(objects);
  }
  
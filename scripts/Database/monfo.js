document.addEventListener('DOMContentLoaded', () => {
    const createProductBtn = document.getElementById('create-product-btn');
    const createProductModal = document.getElementById('create-product-modal');
    const modalTitle = document.getElementById('modal-title');
    const closeButton = createProductModal.querySelector('.close-button');
    const createProductForm = document.getElementById('create-product-form');
    const editResourceIdInput = document.getElementById('edit-resource-id');
    const characteristicsContainer = document.getElementById('characteristics-container');
    const productTypeSelect = document.getElementById('product-type');

    const resourceTableBody = document.getElementById('resource-table-body');
    const resourceGrid = document.getElementById('resource-grid');
    const resourceDetailsDiv = document.getElementById('resource-details');
    const resourceTable = document.getElementById('resource-table');

    const trashIcon = document.getElementById('trash-icon');
    const trashMenu = document.getElementById('trash-menu');
    const trashedItemsList = document.getElementById('trashed-items-list');

    let db;
    let isDraggingModal = false;
    let modalOffsetX, modalOffsetY;
    // const modalHeader = document.getElementById('modal-title'); // Already defined as modalTitle

    let isDraggingTrash = false;
    let trashOffsetX, trashOffsetY;
    const trashHeader = trashMenu.querySelector('h3');

    // Definition of characteristics for each product type
    const productCharacteristics = {
        'Resistors': ['Resistance (Ohm)', 'Power (Watt)', 'Tolerance (%)', 'Case Type'],
        'Capacitors': ['Capacitance (Farad)', 'Working Voltage (Volt)', 'Type', 'Tolerance (%)', 'Case Type'],
        'Inductors': ['Inductance (Henry)', 'Current (Ampere)', 'Type'],
        'Diodes': ['Type', 'Forward Voltage (Volt)', 'Reverse Voltage (Volt)', 'Maximum Current (Ampere)'],
        'Transistors': ['Type', 'Polarity', 'Maximum Collector Current (Ampere)', 'Maximum Collector-Emitter Voltage (Volt)'],
        'Operational Amplifiers': ['Type', 'Number of Channels', 'Supply Voltage (Volt)'],
        'Comparators': ['Type', 'Response Time (ns)'],
        'Voltage Regulators': ['Type', 'Output Voltage (Volt)', 'Maximum Current (Ampere)'],
        'Sensors': ['Sensor Type', 'Measurement Range', 'Accuracy'],
        'Potentiometers': ['Resistance (Ohm)', 'Type'],
        'Thermistors': ['Type', 'Nominal Resistance (Ohm)'],
        'Varistors': ['Maximum Voltage (Volt)'],
        'Basic Logic Gates': ['Type', 'Number of Inputs', 'Series'],
        'Flip-Flops': ['Type', 'Synchronization Type'],
        'Counters': ['Type', 'Maximum Count'],
        'Registers': ['Type', 'Number of Bits'],
        'Multiplexers': ['Number of Inputs', 'Number of Outputs'],
        'Demultiplexers': ['Number of Inputs', 'Number of Outputs'],
        'Encoders': ['Number of Inputs', 'Number of Outputs'],
        'Decoders': ['Number of Inputs', 'Number of Outputs'],
        'RAM': ['Type', 'Capacity (Bytes)'],
        'ROM': ['Type', 'Capacity (Bytes)'],
        'Microcontrollers': ['Family', 'Clock Frequency (MHz)', 'Memory Size (KB)'],
        'Microprocessors': ['Series', 'Clock Frequency (GHz)', 'Number of Cores'],
        'FPGA': ['Family', 'Number of Logic Cells'],
        'CPLD': ['Family', 'Number of Macrocells'],
        'Breadboards': ['Size', 'Number of Points'],
        'Perfboards': ['Size', 'Material'],
        'Single-Layer PCBs': ['Size', 'Material'],
        'Double-Layer PCBs': ['Size', 'Material'],
        'Multi-Layer PCBs': ['Size', 'Number of Layers'],
        'Flexible PCBs': ['Size', 'Material'],
        'Evaluation Boards': ['Purpose', 'Supported ICs'],
        'Development Boards': ['Purpose', 'Microcontroller/Processor'],
        'Multimeter': ['Voltage Range', 'Current Range', 'Resistance Range'],
        'Oscilloscope': ['Number of Channels', 'Bandwidth (MHz)'],
        'Signal Generator': ['Signal Type', 'Frequency Range'],
        'Power Supply': ['Output Voltage (Volt)', 'Output Current (Ampere)'],
        'Soldering Iron and Accessories': ['Iron Type', 'Power (Watt)'],
        'Wire Strippers and Cutters': ['Tool Type'],
        'Pliers, Cutters, Tweezers': ['Tool Type'],
        'Screwdrivers': ['Set Type'],
        'Spectrum Analyzer': ['Frequency Range'],
        'LCR Meter': ['Inductance Measurement Range', 'Capacitance Measurement Range', 'Resistance Measurement Range'],
        'Logic Analyzer': ['Number of Channels', 'Sampling Rate (MHz)'],
        'Programmers': ['Supported ICs'],
        'Debuggers': ['Supported ICs'],
        'Electronic Circuit Simulators': ['Supported Platforms'],
        'PCB Design Software': ['Main Features'],
        'Microcontroller IDEs': ['Supported Microcontrollers'],
        'Hardware Description Languages (HDL)': ['Supported Languages'],
        'Sensor Modules': ['Sensor Type', 'Interface'],
        'Power Modules': ['Input Voltage (Volt)', 'Output Voltage (Volt)', 'Output Current (Ampere)'],
        'Amplifier Modules': ['Amplifier Type', 'Gain'],
        'Filter Modules': ['Filter Type', 'Cutoff Frequency'],
        'RF Modules': ['Operating Frequency', 'Protocol'],
        'ADC Modules': ['Resolution (bit)', 'Sampling Rate (kHz)'],
        'DAC Modules': ['Resolution (bit)', 'Sampling Rate (kHz)'],
        'Microcontroller Modules': ['Microcontroller', 'Interfaces'],
        'Memory Modules': ['Memory Type', 'Capacity'],
        'Display Modules': ['Display Type', 'Resolution'],
        'Communication Modules': ['Module Type', 'Protocol'],
        'Relay Modules': ['Number of Channels', 'Maximum Current (Ampere)'],
        'Motor Driver Modules': ['Motor Type', 'Maximum Current (Ampere)'],
        'Real-Time Clock (RTC) Modules': ['Accuracy', 'Interface'],
    };

    // Initialize Dexie.js
    db = new Dexie('ResourceDatabase');
    db.version(2).stores({ // Increment version number
        resources: '++id, name, type, photo, description, characteristics, status'
    });

    const RESOURCE_STATUS = {
        ACTIVE: 'active',
        TRASHED: 'trashed'
    };

    // Function to display the modal window for creating a product
    function openCreateModal() {
        modalTitle.textContent = 'Create New Product';
        editResourceIdInput.value = '';
        createProductModal.style.display = 'block';
        createProductForm.reset();
        characteristicsContainer.innerHTML = '';
        // Reset modal position when opening for creation
        createProductModal.querySelector('.modal-content').style.left = '';
        createProductModal.querySelector('.modal-content').style.top = '';
    }

    // Function to display the modal window for editing a product
    async function openEditModal(resourceId) {
        modalTitle.textContent = 'Edit Product';
        editResourceIdInput.value = resourceId;
        createProductModal.style.display = 'block';
        createProductForm.reset();
        characteristicsContainer.innerHTML = '';

        const resource = await db.resources.get(resourceId);
        if (resource) {
            document.getElementById('name').value = resource.name;
            document.getElementById('product-type').value = resource.type;
            document.getElementById('description').value = resource.description;
            // Trigger change event to load characteristics
            const event = new Event('change');
            productTypeSelect.dispatchEvent(event);

            // Populate characteristic fields
            setTimeout(() => {
                for (const key in resource.characteristics) {
                    const input = document.querySelector(`input[name="characteristic-${key}"]`);
                    if (input) {
                        input.value = resource.characteristics[key];
                    }
                }
            }, 100); // Small delay to ensure fields are generated
            document.getElementById('photo-url').value = resource.photo && resource.photo.startsWith('http') ? resource.photo : '';
        }
        // Reset modal position when opening for edit
        createProductModal.querySelector('.modal-content').style.left = '';
        createProductModal.querySelector('.modal-content').style.top = '';
    }

    // Function to hide the modal window
    function closeModal() {
        createProductModal.style.display = 'none';
        isDraggingModal = false; // Ensure dragging state is reset
        document.removeEventListener("mousemove", onMouseMoveModal);
        document.removeEventListener("mouseup", onMouseUpModal);
    }

    // Event handler for the "Create Product" button click
    createProductBtn.addEventListener('click', openCreateModal);

    // Event handler for the modal window close button click
    closeButton.addEventListener('click', closeModal);

    // Event handler for clicking outside the modal window to close it
    window.addEventListener('click', (event) => {
        if (event.target === createProductModal) {
            closeModal();
        }
    });

    // Function to dynamically add characteristic fields
    productTypeSelect.addEventListener('change', () => {
        const selectedProductType = productTypeSelect.value;
        characteristicsContainer.innerHTML = ''; // Clear previous fields

        if (productCharacteristics[selectedProductType]) {
            productCharacteristics[selectedProductType].forEach(characteristic => {
                const formGroup = document.createElement('div');
                formGroup.classList.add('form-group');
                const label = document.createElement('label');
                label.setAttribute('for', `characteristic-${characteristic.replace(/[^a-zA-Z0-9]/g, '')}`);
                label.textContent = characteristic + ':';
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `characteristic-${characteristic.replace(/[^a-zA-Z0-9]/g, '')}`;
                input.name = `characteristic-${characteristic}`;
                formGroup.appendChild(label);
                formGroup.appendChild(input);
                characteristicsContainer.appendChild(formGroup);
            });
        }
    });

    // Event handler for submitting the product creation/editing form
    createProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const productType = productTypeSelect.value;
        const photoFile = document.getElementById('photo').files[0];
        const photoUrl = document.getElementById('photo-url').value;
        const description = document.getElementById('description').value;
        const characteristics = {};
        const resourceId = editResourceIdInput.value;

        // Collect entered characteristics
        const characteristicInputs = characteristicsContainer.querySelectorAll('input[type="text"]');
        characteristicInputs.forEach(input => {
            const characteristicName = input.name.replace('characteristic-', '');
            characteristics[characteristicName] = input.value;
        });

        let photo = null;
        if (photoFile) {
            photo = await readFileAsBase64(photoFile);
        } else if (photoUrl) {
            photo = photoUrl;
        }

        const resourceData = {
            name: name,
            type: productType,
            photo: photo,
            description: description,
            characteristics: characteristics,
            status: RESOURCE_STATUS.ACTIVE
        };

        if (resourceId) {
            await db.resources.update(parseInt(resourceId), resourceData);
        } else {
            await db.resources.add(resourceData);
        }

        closeModal();
        await loadResources(); // Update views after adding/editing
    });

    // Function to read file as Base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Function to handle deleting a resource (move to trash)
    async function deleteResource(resourceId) {
        await db.resources.update(resourceId, { status: RESOURCE_STATUS.TRASHED });
        await loadResources();
        await loadTrashedResources();
    }

    // Function to handle duplicating a resource
    async function duplicateResource(resourceId) {
        const originalResource = await db.resources.get(resourceId);
        if (originalResource) {
            const { id, ...resourceData } = originalResource;
            await db.resources.add({ ...resourceData, name: `${resourceData.name} (Copy)` });
            await loadResources();
        }
    }

    // Function to display resources in the table
    async function renderTable(resources) {
        resourceTableBody.innerHTML = '';
        if (resources.length > 0) {
            // Add headers for dynamic characteristics
            const firstResourceCharacteristics = Object.keys(resources[0].characteristics);
            let existingHeaders = Array.from(resourceTable.querySelectorAll('thead th')).map(th => th.textContent);
            firstResourceCharacteristics.forEach(char => {
                if (!existingHeaders.includes(char)) {
                    const th = document.createElement('th');
                    th.textContent = char;
                    resourceTable.querySelector('thead tr').appendChild(th);
                }
            });

            resources.forEach(resource => {
                if (resource.status === RESOURCE_STATUS.ACTIVE) {
                    const row = resourceTableBody.insertRow();
                    const nameCell = row.insertCell();
                    nameCell.textContent = resource.name;
                    const photoCell = row.insertCell();
                    if (resource.photo) {
                        const img = document.createElement('img');
                        img.src = resource.photo;
                        img.style.maxWidth = '50px';
                        img.style.maxHeight = '50px';
                        photoCell.appendChild(img);
                    }
                    const descriptionCell = row.insertCell();
                    descriptionCell.textContent = resource.description ? resource.description.substring(0, 50) + '...' : '';

                    const actionsCell = row.insertCell();
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.addEventListener('click', () => openEditModal(resource.id));
                    actionsCell.appendChild(editButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.addEventListener('click', () => deleteResource(resource.id));
                    actionsCell.appendChild(deleteButton);

                    const duplicateButton = document.createElement('button');
                    duplicateButton.textContent = 'Duplicate';
                    duplicateButton.addEventListener('click', () => duplicateResource(resource.id));
                    actionsCell.appendChild(duplicateButton);

                    // Add cells for dynamic characteristics
                    firstResourceCharacteristics.forEach(char => {
                        const charCell = row.insertCell();
                        charCell.textContent = resource.characteristics[char] || '';
                    });
                }
            });
        } else {
            resourceTableBody.innerHTML = '<tr><td colspan="4">No active resources available.</td></tr>';
        }
    }

    // Function to display resources on the main page
    function renderMainPage(resources) {
        resourceGrid.innerHTML = '';
        resources.forEach(resource => {
            if (resource.status === RESOURCE_STATUS.ACTIVE) {
                const card = document.createElement('div');
                card.classList.add('resource-card');
                if (resource.photo) {
                    const img = document.createElement('img');
                    img.src = resource.photo;
                    img.alt = resource.name;
                    card.appendChild(img);
                }
                const nameHeading = document.createElement('h3');
                nameHeading.textContent = resource.name;
                card.appendChild(nameHeading);
                const detailsButton = document.createElement('button');
                detailsButton.textContent = 'Details';
                detailsButton.addEventListener('click', () => showResourceDetails(resource.id));
                card.appendChild(detailsButton);

                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => openEditModal(resource.id));
                card.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteResource(resource.id));
                card.appendChild(deleteButton);

                const duplicateButton = document.createElement('button');
                duplicateButton.textContent = 'Duplicate';
                duplicateButton.addEventListener('click', () => duplicateResource(resource.id));
                card.appendChild(duplicateButton);

                resourceGrid.appendChild(card);
            }
        });
    }


    // Function to display resource details on the information page
    async function showResourceDetails(resourceId) {
        const resource = await db.resources.get(resourceId);
        if (resource && resource.status === RESOURCE_STATUS.ACTIVE) {
            resourceDetailsDiv.innerHTML = `
                <h3>${resource.name}</h3>
                ${resource.photo ? `<img src="${resource.photo}" alt="${resource.name}" style="max-width: 300px;">` : ''}
                <p><strong>Description:</strong> ${resource.description || 'No description'}</p>
                <h4>Characteristics:</h4>
                <ul class="characteristics-list">
                    ${Object.entries(resource.characteristics).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
                </ul>
                <div class="product-actions">
                    <button class="edit-btn" data-id="${resource.id}">Edit</button>
                    <button class="delete-btn" data-id="${resource.id}">Delete</button>
                    <button class="duplicate-btn" data-id="${resource.id}">Duplicate</button>
                </div>
            `;

            // Attach event listeners to the buttons
            const editBtn = resourceDetailsDiv.querySelector('.edit-btn');
            const deleteBtn = resourceDetailsDiv.querySelector('.delete-btn');
            const duplicateBtn = resourceDetailsDiv.querySelector('.duplicate-btn');

            if (editBtn) {
                editBtn.addEventListener('click', () => openEditModal(resource.id));
            }
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteResource(resource.id));
            }
            if (duplicateBtn) {
                duplicateBtn.addEventListener('click', () => duplicateResource(resource.id));
            }

        } else if (resource && resource.status === RESOURCE_STATUS.TRASHED) {
            resourceDetailsDiv.innerHTML = '<p>This resource is in the trash.</p>';
        } else {
            resourceDetailsDiv.innerHTML = '<p>Resource information not found.</p>';
        }
    }

    // Function to load and display active resources
    async function loadResources() {
        const activeResources = await db.resources.where('status').equals(RESOURCE_STATUS.ACTIVE).toArray();
        renderTable(activeResources);
        renderMainPage(activeResources);
        // Show details of the first active resource by default
        const firstActiveResource = activeResources.length > 0 ? activeResources[0] : null;
        if (firstActiveResource) {
            showResourceDetails(firstActiveResource.id);
        } else {
            resourceDetailsDiv.innerHTML = '<p>No active resources available to display.</p>';
        }
    }

    // Function to load and display trashed resources in the trash menu
    async function loadTrashedResources() {
        const trashedResources = await db.resources.where('status').equals(RESOURCE_STATUS.TRASHED).toArray();
        trashedItemsList.innerHTML = '';
        if (trashedResources.length > 0) {
            trashedResources.forEach(resource => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('trashed-item');
                itemDiv.innerHTML = `
                    <div class="trashed-item-info">${resource.name}</div>
                    <div class="trashed-item-actions">
                        <button class="restore-btn" data-id="${resource.id}">Restore</button>
                        <button class="delete-permanent-btn" data-id="${resource.id}">Delete Permanently</button>
                    </div>
                `;
                trashedItemsList.appendChild(itemDiv);
            });

            // Add event listeners for restore and permanent delete buttons
            trashedItemsList.querySelectorAll('.restore-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = parseInt(button.dataset.id);
                    await db.resources.update(id, { status: RESOURCE_STATUS.ACTIVE });
                    await loadResources();
                    await loadTrashedResources();
                });
            });

            trashedItemsList.querySelectorAll('.delete-permanent-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const id = parseInt(button.dataset.id);
                    if (confirm('Are you sure you want to permanently delete this product?')) {
                        await db.resources.delete(id);
                        await loadResources();
                        await loadTrashedResources();
                    }
                });
            });
        } else {
            trashedItemsList.innerHTML = '<p>No items in the trash.</p>';
        }
    }

    // Event listener for the trash icon to toggle the trash menu
    trashIcon.addEventListener('click', () => {
        trashMenu.style.display = (trashMenu.style.display === 'none' || trashMenu.style.display === '') ? 'block' : 'none';
        loadTrashedResources(); // Load trash contents when opened
    });

    // Load resources and trash contents on initialization
    loadResources();
    loadTrashedResources();

    // --- Drag functionality for Modal ---
    modalTitle.addEventListener("mousedown", (e) => {
        isDraggingModal = true;
        const modalContent = createProductModal.querySelector('.modal-content');
        modalOffsetX = e.clientX - modalContent.getBoundingClientRect().left;
        modalOffsetY = e.clientY - modalContent.getBoundingClientRect().top;
        document.addEventListener("mousemove", onMouseMoveModal);
        document.addEventListener("mouseup", onMouseUpModal);
        modalContent.classList.add('draggable'); // Add draggable class for cursor style
    });

    function onMouseMoveModal(e) {
        if (isDraggingModal) {
            const modalContent = createProductModal.querySelector('.modal-content');
            modalContent.style.left = `${e.clientX - modalOffsetX}px`;
            modalContent.style.top = `${e.clientY - modalOffsetY}px`;
        }
    }

    function onMouseUpModal() {
        isDraggingModal = false;
        document.removeEventListener("mousemove", onMouseMoveModal);
        document.removeEventListener("mouseup", onMouseUpModal);
        const modalContent = createProductModal.querySelector('.modal-content');
        modalContent.classList.remove('draggable');
    }

    // --- Drag functionality for Trash Menu ---
    trashHeader.addEventListener('mousedown', (e) => {
        isDraggingTrash = true;
        trashOffsetX = e.clientX - trashMenu.getBoundingClientRect().left;
        trashOffsetY = e.clientY - trashMenu.getBoundingClientRect().top;
        document.addEventListener("mousemove", onMouseMoveTrash);
        document.addEventListener("mouseup", onMouseUpTrash);
        trashMenu.classList.add('draggable'); // Add draggable class for cursor style
    });

    function onMouseMoveTrash(e) {
        if (isDraggingTrash) {
            trashMenu.style.left = `${e.clientX - trashOffsetX}px`;
            trashMenu.style.top = `${e.clientY - trashOffsetY}px`;
        }
    }

    function onMouseUpTrash() {
        isDraggingTrash = false;
        document.removeEventListener("mousemove", onMouseMoveTrash);
        document.removeEventListener("mouseup", onMouseUpTrash);
        trashMenu.classList.remove('draggable');
    }
});
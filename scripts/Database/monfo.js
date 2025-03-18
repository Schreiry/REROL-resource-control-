document.addEventListener('DOMContentLoaded', () => {
    const createProductBtn = document.getElementById('create-product-btn');
    const createProductModal = document.getElementById('create-product-modal');
    const closeButton = createProductModal.querySelector('.close-button');
    const createProductForm = document.getElementById('create-product-form');
    const characteristicsContainer = document.getElementById('characteristics-container');
    const productTypeSelect = document.getElementById('product-type');

    const resourceTableBody = document.getElementById('resource-table-body');
    const resourceGrid = document.getElementById('resource-grid');
    const resourceDetailsDiv = document.getElementById('resource-details');
    const resourceTable = document.getElementById('resource-table');

    let db;

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
    db.version(1).stores({
        resources: '++id, name, type, photo, description, characteristics'
    });

    // Function to display the modal window
    function openModal() {
        createProductModal.style.display = 'block';
        // Reset the form when opened
        createProductForm.reset();
        characteristicsContainer.innerHTML = '';
    }

    // Function to hide the modal window
    function closeModal() {
        createProductModal.style.display = 'none';
    }

    // Event handler for the "Create Product" button click
    createProductBtn.addEventListener('click', openModal);

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

    // Event handler for submitting the product creation form
    createProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const productType = productTypeSelect.value;
        const photoFile = document.getElementById('photo').files[0];
        const photoUrl = document.getElementById('photo-url').value;
        const description = document.getElementById('description').value;
        const characteristics = {};

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

        // Save data to the database
        await db.resources.add({
            name: name,
            type: productType,
            photo: photo,
            description: description,
            characteristics: characteristics
        });

        closeModal();
        await loadResources(); // Update views after adding
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
                const detailsButton = document.createElement('button');
                detailsButton.textContent = 'Details';
                detailsButton.addEventListener('click', () => showResourceDetails(resource.id));
                actionsCell.appendChild(detailsButton);

                // Add cells for dynamic characteristics
                firstResourceCharacteristics.forEach(char => {
                    const charCell = row.insertCell();
                    charCell.textContent = resource.characteristics[char] || '';
                });
            });
        } else {
            resourceTableBody.innerHTML = '<tr><td colspan="4">No resources available.</td></tr>';
        }
    }

    // Function to display resources on the main page
    function renderMainPage(resources) {
        resourceGrid.innerHTML = '';
        resources.forEach(resource => {
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
            resourceGrid.appendChild(card);
        });
    }

    // Function to display resource details on the information page
    async function showResourceDetails(resourceId) {
        const resource = await db.resources.get(resourceId);
        if (resource) {
            resourceDetailsDiv.innerHTML = `
                <h3>${resource.name}</h3>
                ${resource.photo ? `<img src="${resource.photo}" alt="${resource.name}" style="max-width: 300px;">` : ''}
                <p><strong>Description:</strong> ${resource.description || 'No description'}</p>
                <h4>Characteristics:</h4>
                <ul>
                    ${Object.entries(resource.characteristics).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
                </ul>
            `;
        } else {
            resourceDetailsDiv.innerHTML = '<p>Resource information not found.</p>';
        }
    }

    // Function to load and display resources
    async function loadResources() {
        const allResources = await db.resources.toArray();
        renderTable(allResources);
        renderMainPage(allResources);
        // Show details of the first resource by default (you can change the logic)
        if (allResources.length > 0) {
            showResourceDetails(allResources[0].id);
        } else {
            resourceDetailsDiv.innerHTML = '<p>No resources available to display.</p>';
        }
    }

    // Load resources on initialization
    loadResources();

    // Implementation of modal window dragging
    let isDragging = false;
    let offsetX, offsetY;
    const modalHeader = createProductModal.querySelector('.modal-content > h2'); // Or another area to grab

    modalHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - createProductModal.querySelector('.modal-content').getBoundingClientRect().left;
        offsetY = e.clientY - createProductModal.querySelector('.modal-content').getBoundingClientRect().top;
        createProductModal.classList.add('draggable');
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        createProductModal.querySelector('.modal-content').style.left = e.clientX - offsetX + 'px';
        createProductModal.querySelector('.modal-content').style.top = e.clientY - offsetY + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            createProductModal.classList.remove('draggable');
        }
    });
});
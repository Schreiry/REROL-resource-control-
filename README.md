# 📝 REROL - Resource Control

**REROL** is a localized web application designed for intuitive resource management, offering a streamlined approach to organizing physical assets such as boxes, cellular organizers, and tables. Built with simplicity and efficiency in mind, it leverages a blockchain-inspired logging system to track user actions, ensuring transparency and accountability.

---

## ✨ Features

- **User Authentication**: Secure registration and login system with localized storage.
- **Object Management**: Create, edit, duplicate, and delete objects with dynamic animations.
  - **Boxes**: Track capacity, color, purpose, and item count.
  - **Cellular Organizers**: Manage cells, products, and quantities with interactive grids.
  - **Tables**: Assign orientations, numbers, and monitor attached boxes/organizers.
- **Blockchain-like Logging**: Immutable action logs stored in `localStorage` for audit trails.
  - Each log entry includes hashes, timestamps, user actions, and data snapshots.
- **Export Capabilities**: Download activity logs in a structured text format.
- **Responsive UI**: Clean, Google-inspired design with smooth animations and transitions.
- **Drag-and-Delete**: Visual trash can interaction for object deletion.

---

## 🛠 Technologies Used

- **Frontend**: HTML5, CSS3 (Flexbox, Grid), Vanilla JavaScript
- **Data Storage**: `localStorage` for persistent user data and logs.
- **Security**: Simplified hashing for log integrity (Base64-based).
- **Animations**: CSS keyframes and transitions for interactive elements.

---

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge).
- No server or database required—runs entirely client-side.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Schreiry/REROL-resource-control-

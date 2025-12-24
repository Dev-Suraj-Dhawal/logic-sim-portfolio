# Logic-Sim-Portfolio (LogicBench)

A responsive, interactive **digital logic gate simulator** built with vanilla HTML/CSS/JavaScript.  
Drag components onto the circuit board, connect wires, simulate outputs instantly, and learn using the built-in handbook (truth tables + guided examples).

> Designed as a portfolio-grade web app: clean UI, fast runtime, and deployable as a static site.

---

## Table of Contents
- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Customization](#customization)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Demo
- Local: open `index.html` in a browser (recommended: Chrome/Edge/Firefox).
- Live demo: *(https://logicbench.netlify.app/)*

---

## Features
### Circuit editor
- Add components from the Library (click-to-add, and drag-and-drop on supported devices).
- Move components freely; wires stay connected.
- Connect outputs to inputs with interactive nodes.
- Disconnect and rewire connections quickly.
- Delete a selected component/wire using keyboard shortcuts.

### Simulation
- Real-time logic evaluation (switches → gates → outputs).
- Visual wire state feedback (active/high vs inactive/low).

### Learning & reference
- Built-in handbook for core logic gates (truth tables, boolean expressions, tutor-style steps).
- Example “build this circuit” flow for each gate.

### UX & productivity
- Keyboard shortcuts (Delete, Escape, etc.).
- Clean, responsive layout for mobile, tablet, desktop, and large screens.

---

## Tech Stack
- **HTML5** for structure
- **CSS3** for UI styling and responsiveness
- **Vanilla JavaScript** for simulation logic + canvas rendering
- **Canvas API** for the circuit board rendering

No framework, no build step, no dependencies.

---

## Getting Started
### 1) Clone the repo
git clone <https://github.com/Dev-Suraj-Dhawal/logic-sim-portfolio>
cd Logic-Sim-Portfolio


### 2) Run locally
Option A (quick): open `index.html` directly in your browser.

Option B (recommended): use a local server (prevents some browser restrictions).


---

## How to Use
### Add components
- Use the **Library** to add:
  - Switches (input)
  - Bulbs/Indicators (output)
  - Logic gates (AND/OR/NOT/NAND/NOR/XOR/XNOR)

### Connect wires
1. Click an **output node** on a component.
2. Click an **input node** on another component to create a wire.

### Toggle switches
- Click a switch to turn it **ON/OFF**.

### Delete / cancel
- **Delete / Backspace**: remove selected wire or component.
- **Esc**: cancel wiring mode.

---

## Project Structure
Based on the current repository layout:

Logic-Sim-Portfolio/
├─ Brain/
│ └─ logic.js # Core simulation engine + canvas interactions
├─ CSS/
│ └─ beauty.css # UI theme + responsive styling
├─ index.html # App entry (layout + linking CSS/JS)
├─ LICENSE # Project license
├─ .gitignore # Git ignore rules
└─ README.md # Project documentation


---

## Customization
### UI / theme
Edit:
- `CSS/beauty.css`

Common customizations:
- Colors, spacing, shadows, borders
- Sidebar width and responsive breakpoints
- Canvas background grid styling

### Simulation logic
Edit:
- `Brain/logic.js`

Common extensions:
- Add more components (e.g., clock, flip-flops)
- Add persistence (save/load circuit JSON)
- Add undo/redo command stack
- Add export as image / shareable link

---

## Deployment
This project is a **static site**. You can deploy it to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting

General steps:
1. Ensure `index.html` is at the repository root.
2. Deploy the repository as a static site.
3. Confirm paths are correct for:
   - `CSS/beauty.css`
   - `Brain/logic.js`

---

## Roadmap
Planned improvements:
- Save/Load circuits (JSON)
- Undo/Redo
- Touch-optimized drag from library for all mobile browsers
- More advanced circuits (Half Adder / Full Adder demos)
- Accessibility pass (keyboard navigation + ARIA improvements)

---

## Contributing
Contributions are welcome.

Suggested workflow:
1. Fork the repository
2. Create a feature branch:
3. Commit changes with clear messages
4. Open a Pull Request

---

## License
This project is licensed under the terms in the `LICENSE` file.


# ♻️ EcoSort AI — Waste Intelligence & Computer Vision Classification Engine

![EcoSort AI](https://img.shields.io/badge/EcoSort%20AI-v2.4.0-emerald?style=for-the-badge&logo=eco)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-2.4_Flash-8E75B2?style=for-the-badge&logo=googlegemini)

**EcoSort AI** is an enterprise-grade web application that leverages **Google Gemini 2.4 Flash Vision AI** to classify waste items, calculate environmental impact metrics, provide step-by-step segregation guidance, and present real-time recycling analytics.

---

## ✨ Features

- 📸 **AI Vision & Text Waste Classification**: Upload waste photos or describe items to receive instant, multi-spectral waste identification.
- ♻️ **Bin Routing & Segregation Guidance**: Classifies materials into *Recyclables, Compostable/Organic, Hazardous/E-Waste, Landfill,* or *Upcycling candidate*.
- 📊 **Environmental Impact Metrics**: Calculates exact savings:
  - 🌿 **CO₂ Emissions Saved** (kg)
  - ⚡ **Energy Saved** (kWh)
  - 💧 **Water Saved** (Liters)
  - ⏳ **Estimated Decomposition Time** (Years)
- 📈 **Real-Time Analytics Dashboard**: Visualizes session scans, diverted landfill percentages, and cumulative carbon offsets using interactive **Recharts**.
- 📚 **Knowledge Catalog & Compliance**: Educational repository aligned with **ISO 14001** standards and municipal zero-waste guidelines.
- ⚡ **Built-in Smart Fallback Engine**: Generates intelligent classification reports even if an API key is not yet configured.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Animations), Lucide React (Icons), Recharts
- **Backend & Server**: Express 4, Node.js, Vite Dev Server (`server.ts`)
- **AI Model**: `@google/genai` (Google Gemini 2.4 Flash)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yukthivarma27-code/EcoSort.git
   cd EcoSort
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** *(Optional for AI Features)*:
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   > *Note: If no API key is provided, EcoSort AI runs in fallback mode with simulated AI classification for offline testing.*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) or [http://127.0.0.1:3000](http://127.0.0.1:3000).

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Express server with embedded Vite middleware on `http://localhost:3000`. |
| `npm run build` | Builds the React frontend bundle and compiles `server.ts` into `dist/server.cjs`. |
| `npm start` | Runs the production bundle server. |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`). |

---

## 📁 Directory Structure

```text
ecosort-ai/
├── src/
│   ├── components/      # React UI components (Header, Classifier, Dashboard, Catalog, Modals)
│   ├── data/            # Preset waste catalog and sample datasets
│   ├── types.ts         # TypeScript definitions and data interfaces
│   ├── App.tsx          # Main React application component
│   └── main.tsx         # Application entry point
├── server.ts            # Express server with Vite middleware & Gemini API routes
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
├── vite.config.ts       # Vite & Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

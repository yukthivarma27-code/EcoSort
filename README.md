# EcoSort AI

![EcoSort AI Banner](https://img.shields.io/badge/EcoSort--AI-Waste%20Intelligence%20Platform-10B981?style=for-the-badge&logo=eco&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**EcoSort AI** is an AI-powered waste classification web application that uses computer vision to identify different types of waste from an uploaded image or live camera capture and provides appropriate disposal recommendations to encourage sustainable waste management.

The application aims to bridge the gap between waste generation and environmental responsibility by providing users with instant, actionable guidance on how to properly segregate recyclables, compostables, hazardous materials, and general waste. By leveraging state-of-the-art computer vision models and real-time environmental metrics, EcoSort AI empowers communities, municipal centers, and households to reduce landfill impact and maximize recycling efficiency.

Designed with a sleek, dark-mode modern interface, EcoSort AI combines interactive AI scanning feedback, confidence scoring, step-by-step disposal procedures, and localized upcycling ideas into an intuitive, accessible experience across all modern desktop and mobile devices.

---

## Features

- **AI-Powered Waste Classification**: Instant identification of items using computer vision and deep learning vision models.
- **Upload Image from Device**: Easily drag-and-drop or select images from your computer or phone.
- **Capture Image Using Camera**: Direct integrated camera feed to capture snapshots of physical waste items in real time.
- **Image Preview Before Prediction**: Visual confirmation modal to crop or inspect target materials before submitting for AI analysis.
- **AI Scanning Animation**: Interactive, laser-line scanning animation providing visual feedback during model inference.
- **Waste Category Prediction**: Categorizes items into *Recyclables, Compostable/Organic, E-Waste/Hazardous, Landfill,* or *Upcycling Candidate*.
- **Confidence Score**: Transparent percentage reliability score for each detected waste classification.
- **Disposal Recommendations**: Tailored, step-by-step instructions on cleaning, sorting, and bin selection.
- **Recycling Tips**: Environmental facts and creative upcycling suggestions for reusable materials.
- **Responsive UI**: Seamlessly optimized layout for smartphones, tablets, and desktop displays.
- **Dark Mode**: Sleek, high-contrast dark theme designed to reduce eye strain and enhance visuals.
- **Modern Premium Interface**: Dynamic micro-animations, glassmorphism cards, and interactive data visualization charts.

---

## Tech Stack

### Frontend
- **React** (v19) — UI component architecture
- **TypeScript** — Static typing and robust developer tooling
- **Vite** — High-performance development server and asset bundler
- **Tailwind CSS** (v4) — Utility-first styling framework
- **Framer Motion** (`motion`) — Smooth UI animations and scanning transitions
- **Lucide React** — Icon library for clean visual navigation

### Backend
- **Express.js / Node.js** — API server and static asset host
- **Google Gemini API** (`@google/genai`) — Vision AI classification engine
- *Backend (Architecture Support)*: Flask / FastAPI, TensorFlow / Keras, OpenCV

---

## Folder Structure

```text
ecosort-ai/
├── public/                  # Public static assets
├── src/
│   ├── assets/              # Icons and image assets
│   ├── components/          # Reusable UI components
│   │   ├── AnalyticsDashboard.tsx   # Real-time recycling metrics & charts
│   │   ├── Footer.tsx               # App footer & legal triggers
│   │   ├── Header.tsx               # Navigation bar & active tab selector
│   │   ├── KnowledgeCatalog.tsx     # ISO 14001 waste sorting guidelines
│   │   ├── LegalModals.tsx          # Privacy policy & terms of service
│   │   └── WasteClassifier.tsx      # Main camera & photo scanning module
│   ├── data/                # Preset item datasets & sample classifications
│   ├── types.ts             # TypeScript interfaces for classification reports
│   ├── App.tsx              # Core app container & router logic
│   ├── index.css            # Global CSS styles & Tailwind imports
│   └── main.tsx             # React DOM root entry point
├── server.ts                # Express backend server with Vite middleware integration
├── index.html               # Main HTML entry file
├── package.json             # NPM dependencies and scripts
├── tsconfig.json            # TypeScript compiler configuration
└── vite.config.ts           # Vite build and Tailwind plugin setup
```

---

## Installation

Follow these steps to set up and run EcoSort AI on your local machine:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yukthivarma27-code/EcoSort.git
   cd ecosort-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** *(Optional)*:
   Create a `.env` file in the project root to configure your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) or [http://127.0.0.1:3000](http://127.0.0.1:3000) to view the application.

---

## How It Works

1. **Select Input Method**: Choose to upload an image from your device or activate your webcam for live camera capture.
2. **Preview & Scan**: Review your photo in the preview modal and click **Scan Item**.
3. **AI Inference**: The vision engine processes the image, detects material composition, and calculates confidence scores.
4. **Get Recommendations**: View bin routing, specific cleaning/segregation steps, CO₂/energy savings, and upcycling ideas.

---

## Contributing

Contributions are welcome! If you would like to contribute to EcoSort AI:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git checkout -b feature/AmazingFeature`).
5. Open a Pull Request.

---

## License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

# EcoSort AI — Waste Intelligence Platform

![EcoSort AI Banner](https://img.shields.io/badge/EcoSort--AI-Waste%20Intelligence%20Platform-10B981?style=for-the-badge&logo=eco&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**EcoSort AI** is an AI-powered waste classification web application that uses computer vision to identify different types of waste from an uploaded image or live camera capture and provides actionable disposal, segregation, and recycling recommendations.

---

## 🌟 Key Features

- 📸 **Live Camera & Photo Upload**: Capture photos directly via webcam or drag-and-drop images.
- 🔍 **Real-Time Image Preview**: Crop, inspect, and verify target objects before initiating analysis.
- ⚡ **AI Waste Classification**: Classifies waste items across 12 distinct waste categories.
- 🎯 **Confidence Scoring**: Transparent probability scores for classifications.
- ♻️ **Actionable Disposal Guidance**: Step-by-step cleaning, segregation, and municipal bin routing instructions.
- 📊 **Environmental Impact Metrics**: Calculates estimated CO₂ emission reductions, energy conserved, and water saved.
- 🎨 **Modern Dark-Mode UI**: Built with React 19, Tailwind CSS v4, smooth animations, and interactive charts.

---

## 🏗️ Project Architecture

```text
ecosort-ai/
├── src/                         # Frontend application (React 19 + TypeScript)
│   ├── components/              # Reusable UI components
│   │   ├── AnalyticsDashboard.tsx   # Real-time recycling metrics & charts
│   │   ├── Footer.tsx               # App footer & legal triggers
│   │   ├── Header.tsx               # Navigation bar & active tab selector
│   │   ├── KnowledgeCatalog.tsx     # ISO 14001 waste sorting guidelines
│   │   ├── LegalModals.tsx          # Privacy policy & terms of service
│   │   └── WasteClassifier.tsx      # Main camera & photo scanning module
│   ├── data/                    # Preset items & sample classifications
│   ├── types.ts                 # TypeScript data contracts & schemas
│   ├── App.tsx                  # Core app container & navigation logic
│   ├── index.css                # Global CSS styles & Tailwind imports
│   └── main.tsx                 # React DOM root entry point
│
├── ml/                          # Machine learning pipeline
│   ├── scripts/
│   │   ├── download_dataset.py  # Kaggle dataset downloader
│   │   └── inspect_dataset.py   # Dataset integrity, resolution & class distribution inspector
│   ├── dataset_report.md        # Comprehensive dataset summary report
│   └── dataset_report.json      # Structured dataset metrics & statistics
│
├── dataset/                     # Local waste classification dataset (gitignored)
│   └── raw/
│       └── garbage_classification/
│
├── server.ts                    # Express backend server with Vite integration
├── index.html                   # HTML entry point
├── package.json                 # Node dependencies & npm scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite bundler configuration
└── .gitignore                   # Exclusions for node_modules, .venv, dataset, and secrets
```

---

## 📦 Kaggle Waste Classification Dataset

EcoSort AI uses the **Garbage Classification (12 Classes)** dataset from Kaggle (`mostafaabla/garbage-classification`), containing **15,515 images** across 12 categories:

| # | Class Name | Category | Primary Bin |
| :---: | :--- | :--- | :--- |
| 1 | **battery** | E-Waste & Hazardous | Red Bin (E-Waste / Hazardous) |
| 2 | **biological** | Compostable & Organic | Green Bin (Compost/Organics) |
| 3 | **brown-glass** | Glass & Glassware | Blue Bin (Recycling) |
| 4 | **cardboard** | Paper & Cardboard | Yellow Bin (Paper/Cardboard) |
| 5 | **clothes** | Textile / Upcycling | Donation / Upcycle Hub |
| 6 | **green-glass** | Glass & Glassware | Blue Bin (Recycling) |
| 7 | **metal** | Metal & Aluminum | Blue Bin (Recycling) |
| 8 | **paper** | Paper & Cardboard | Yellow Bin (Paper/Cardboard) |
| 9 | **plastic** | Recyclable Plastics | Blue Bin (Recycling) |
| 10 | **shoes** | Footwear / Reuse | Donation / Special Depot |
| 11 | **trash** | Non-Recyclable Landfill | Gray Bin (General Landfill) |
| 12 | **white-glass** | Glass & Glassware | Blue Bin (Recycling) |

---

## 🚀 Quick Start Guide

### 1. Frontend & Server Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yukthivarma27-code/EcoSort.git
   cd ecosort-ai
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** *(Optional)*:
   Ensure your `.env` file contains your configuration:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   APP_URL=http://localhost:3000
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at **[http://localhost:3000](http://localhost:3000)**.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

### 2. Machine Learning Pipeline Setup

1. **Install Python ML Dependencies**:
   ```bash
   pip install kagglehub pillow numpy scikit-learn tqdm
   ```

2. **Download the Dataset**:
   ```bash
   python ml/scripts/download_dataset.py
   ```

3. **Inspect the Dataset**:
   ```bash
   python ml/scripts/inspect_dataset.py
   ```
   This verifies all image files, checks for corruption, detects duplicate files, and outputs `ml/dataset_report.md`.

---

## 📄 License

This project is open source and available under the **MIT License**.

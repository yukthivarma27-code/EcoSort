# Dataset Inspection Report: Kaggle Garbage Classification (12 Classes)

## 1. Executive Summary
- **Dataset Path:** `C:\Users\yukth\Downloads\ecosort-ai\dataset\raw\garbage_classification`
- **Total Images:** 15,515
- **Valid & Readable Images:** 15,515
- **Corrupted / Unreadable Images:** 0
- **Detected Duplicate Files:** 19 (across 18 duplicate clusters)
- **Total Distinct Classes:** 12
- **Imbalance Ratio (Max / Min):** 8.77 : 1

---

## 2. Discovered Class Breakdown & Distribution
| # | Class Name | Image Count | Distribution % |
| :---: | :--- | :---: | :---: |
| 1 | **battery** | 945 | 6.09% |
| 2 | **biological** | 985 | 6.35% |
| 3 | **brown-glass** | 607 | 3.91% |
| 4 | **cardboard** | 891 | 5.74% |
| 5 | **clothes** | 5,325 | 34.32% |
| 6 | **green-glass** | 629 | 4.05% |
| 7 | **metal** | 769 | 4.96% |
| 8 | **paper** | 1,050 | 6.77% |
| 9 | **plastic** | 865 | 5.58% |
| 10 | **shoes** | 1,977 | 12.74% |
| 11 | **trash** | 697 | 4.49% |
| 12 | **white-glass** | 775 | 5.0% |

---

## 3. Image Formats & Color Encoding
- **File Formats:** {'JPEG': 15481, 'PNG': 34}
- **Color Modes:** {'RGB': 15481, 'P': 34}

---

## 4. Image Dimensions (Resolution Statistics)
- **Width:** Min = 51px | Mean = 349.8px | Max = 888px
- **Height:** Min = 100px | Mean = 351.7px | Max = 936px

---

## 5. Pipeline Preprocessing Directives
1. **Zero Unreadable Images:** All 15,515 images successfully passed PIL verify checks.
2. **Duplicate Image Isolation:** Exact duplicate hashes will be grouped together during stratified train/val/test splitting to prevent data leakage.
3. **Standard Input Geometry:** All images will be resized to **224 x 224 x 3** with bilinear interpolation for EfficientNetB0.
4. **Color Uniformity:** All images will be converted to 3-channel RGB (`.convert('RGB')`).
5. **Class Imbalance Mitigation:** Class weighting will be dynamically computed and passed to model training to prevent majority class (`clothes`, `shoes`) dominance over minority classes (`brown-glass`, `green-glass`, `trash`).

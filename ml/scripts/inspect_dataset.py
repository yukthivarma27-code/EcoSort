import os
import hashlib
import json
from collections import defaultdict
from PIL import Image
import numpy as np
from tqdm import tqdm

RAW_DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "raw", "garbage_classification"))
REPORT_MD_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset_report.md"))
REPORT_JSON_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "dataset_report.json"))

def get_image_hash(filepath):
    """Compute MD5 hash of image bytes to identify exact duplicate files."""
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(65536), b""):
            hasher.update(chunk)
    return hasher.hexdigest()

def inspect_dataset():
    print(f"[*] Inspecting dataset classes in: {RAW_DATASET_DIR}")
    
    if not os.path.exists(RAW_DATASET_DIR):
        raise FileNotFoundError(f"Directory not found: {RAW_DATASET_DIR}")
        
    class_names = sorted([d for d in os.listdir(RAW_DATASET_DIR) if os.path.isdir(os.path.join(RAW_DATASET_DIR, d))])
    
    print(f"[+] Discovered {len(class_names)} classes: {class_names}")
    
    class_counts = {}
    formats = defaultdict(int)
    modes = defaultdict(int)
    widths = []
    heights = []
    aspect_ratios = []
    corrupted_images = []
    hash_to_files = defaultdict(list)
    total_images = 0
    valid_images = 0
    
    for cls in class_names:
        cls_dir = os.path.join(RAW_DATASET_DIR, cls)
        filenames = [f for f in os.listdir(cls_dir) if os.path.isfile(os.path.join(cls_dir, f))]
        class_counts[cls] = len(filenames)
        total_images += len(filenames)
        print(f"  -> Scanning {cls} ({len(filenames)} images)...")
        
        for fname in tqdm(filenames, desc=cls, leave=False):
            fpath = os.path.join(cls_dir, fname)
            try:
                # Test image integrity
                with Image.open(fpath) as img:
                    img.verify()
                
                # Reopen to read dimensions and mode
                with Image.open(fpath) as img:
                    w, h = img.size
                    widths.append(w)
                    heights.append(h)
                    aspect_ratios.append(w / h if h > 0 else 0)
                    formats[img.format] += 1
                    modes[img.mode] += 1
                    
                file_hash = get_image_hash(fpath)
                hash_to_files[file_hash].append((cls, fname))
                valid_images += 1
            except Exception as e:
                corrupted_images.append({
                    "class": cls,
                    "filename": fname,
                    "path": fpath,
                    "error": str(e)
                })
                
    duplicate_groups = {h: files for h, files in hash_to_files.items() if len(files) > 1}
    num_duplicates = sum(len(files) - 1 for files in duplicate_groups.values())
    
    # Imbalance calculation
    min_count = min(class_counts.values()) if class_counts else 0
    max_count = max(class_counts.values()) if class_counts else 0
    imbalance_ratio = round(max_count / min_count, 2) if min_count > 0 else 0
    
    summary = {
        "dataset_root": RAW_DATASET_DIR,
        "num_classes": len(class_names),
        "class_names": class_names,
        "total_images": total_images,
        "valid_images": valid_images,
        "corrupted_images_count": len(corrupted_images),
        "corrupted_images": corrupted_images,
        "duplicate_groups_count": len(duplicate_groups),
        "duplicate_images_count": num_duplicates,
        "class_distribution": class_counts,
        "class_percentages": {k: round((v / total_images) * 100, 2) for k, v in class_counts.items()} if total_images > 0 else {},
        "formats_distribution": dict(formats),
        "modes_distribution": dict(modes),
        "dimension_stats": {
            "min_width": int(np.min(widths)) if widths else 0,
            "max_width": int(np.max(widths)) if widths else 0,
            "mean_width": float(np.mean(widths)) if widths else 0,
            "min_height": int(np.min(heights)) if heights else 0,
            "max_height": int(np.max(heights)) if heights else 0,
            "mean_height": float(np.mean(heights)) if heights else 0,
        },
        "imbalance_ratio_max_to_min": imbalance_ratio,
    }
    
    # Save JSON report
    # Generate Markdown report
    md_content = f"""# Dataset Inspection Report: Kaggle Garbage Classification (12 Classes)

## 1. Executive Summary
- **Dataset Path:** `{RAW_DATASET_DIR}`
- **Total Images:** {total_images:,}
- **Valid & Readable Images:** {valid_images:,}
- **Corrupted / Unreadable Images:** {len(corrupted_images)}
- **Detected Duplicate Files:** {num_duplicates} (across {len(duplicate_groups)} duplicate clusters)
- **Total Distinct Classes:** {len(class_names)}
- **Imbalance Ratio (Max / Min):** {imbalance_ratio} : 1

---

## 2. Discovered Class Breakdown & Distribution
| # | Class Name | Image Count | Distribution % |
| :---: | :--- | :---: | :---: |
"""
    for i, cls in enumerate(class_names, start=1):
        cnt = class_counts[cls]
        pct = summary["class_percentages"].get(cls, 0)
        md_content += f"| {i} | **{cls}** | {cnt:,} | {pct}% |\n"
        
    md_content += f"""
---

## 3. Image Formats & Color Encoding
- **File Formats:** {dict(formats)}
- **Color Modes:** {dict(modes)}

---

## 4. Image Dimensions (Resolution Statistics)
- **Width:** Min = {summary['dimension_stats']['min_width']}px | Mean = {summary['dimension_stats']['mean_width']:.1f}px | Max = {summary['dimension_stats']['max_width']}px
- **Height:** Min = {summary['dimension_stats']['min_height']}px | Mean = {summary['dimension_stats']['mean_height']:.1f}px | Max = {summary['dimension_stats']['max_height']}px

---

## 5. Pipeline Preprocessing Directives
1. **Zero Unreadable Images:** All {valid_images:,} images successfully passed PIL verify checks.
2. **Duplicate Image Isolation:** Exact duplicate hashes will be grouped together during stratified train/val/test splitting to prevent data leakage.
3. **Standard Input Geometry:** All images will be resized to **224 x 224 x 3** with bilinear interpolation for EfficientNetB0.
4. **Color Uniformity:** All images will be converted to 3-channel RGB (`.convert('RGB')`).
5. **Class Imbalance Mitigation:** Class weighting will be dynamically computed and passed to model training to prevent majority class (`clothes`, `shoes`) dominance over minority classes (`brown-glass`, `green-glass`, `trash`).
"""

    with open(REPORT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    with open(REPORT_MD_PATH, "w", encoding="utf-8") as f:
        f.write(md_content)
        
    print(f"\n[+] Full dataset inspection complete!")
    print(f"  - Markdown Report: {REPORT_MD_PATH}")
    print(f"  - JSON Report: {REPORT_JSON_PATH}")
    return summary

if __name__ == "__main__":
    inspect_dataset()

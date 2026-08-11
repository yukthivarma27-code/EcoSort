import os
import shutil
import kagglehub

TARGET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "raw"))

def run():
    print("[*] Downloading dataset 'mostafaabla/garbage-classification' via kagglehub ...")
    path = kagglehub.dataset_download("mostafaabla/garbage-classification")
    print(f"[+] Download complete: {path}")
    
    os.makedirs(TARGET_DIR, exist_ok=True)
    print(f"[*] Copying files to {TARGET_DIR} ...")
    
    for item in os.listdir(path):
        s = os.path.join(path, item)
        d = os.path.join(TARGET_DIR, item)
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d)
            print(f"  -> Copied folder: {item}")
        else:
            shutil.copy2(s, d)
            print(f"  -> Copied file: {item}")
            
    print(f"[+] Successfully mirrored dataset into: {TARGET_DIR}")

if __name__ == "__main__":
    run()

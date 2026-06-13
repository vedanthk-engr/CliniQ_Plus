import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Map previous too-opaque white backgrounds to the new 8-20% tier system rules
    changes = [
        (r'rgba\(255,\s*255,\s*255,\s*0\.4\)', 'rgba(255, 255, 255, 0.08)'),
        (r'rgba\(255,\s*255,\s*255,\s*0\.5\)', 'rgba(255, 255, 255, 0.15)'),
        (r'rgba\(255,\s*255,\s*255,\s*0\.6\)', 'rgba(255, 255, 255, 0.20)'),
        (r'rgba\(255,\s*255,\s*255,\s*0\.8\)', 'rgba(255, 255, 255, 0.25)'),
        (r'rgba\(255,\s*255,\s*255,\s*0\.9\)', 'rgba(255, 255, 255, 0.25)'),
        (r'rgba\(255,\s*255,\s*255,\s*1\)', 'rgba(255, 255, 255, 0.25)'),
    ]

    new_content = content
    for pattern, replacement in changes:
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated transparency in: {filepath}")

def main():
    src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()

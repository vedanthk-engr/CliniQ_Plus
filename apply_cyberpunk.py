import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # In the new Cyberpunk Purple theme, we want to replace common hardcoded
    # backgrounds (both the very dark slates and the recent light-glass whites)
    # with our standard .glass-tier-X classes to ensure the glow pulls through.
    
    # We will use simple regex replacements for known inline styles.
    changes = [
        # Replacing old light glass setups with tier-1/tier-2 inlines just in case 
        # they are hardcoded without CSS classes. We'll use the deep cyber void base.
        (r'rgba\(255,\s*255,\s*255,\s*0\.[0-9]+\)', 'rgba(15, 15, 20, 0.6)'), 
        
        # Replacing old Cliniq dark backgrounds with transparent variants
        (r'rgba\(15,\s*23,\s*42,\s*0\.[0-9]+\)', 'rgba(15, 15, 20, 0.6)'),
        (r'rgba\(15,\s*23,\s*42,\s*1\)', 'rgba(15, 15, 20, 0.7)'),
        (r'rgba\(2,\s*6,\s*23,\s*0\.[0-9]+\)', 'rgba(15, 15, 20, 0.6)'),
        
        # Swapping neon teal for neon purple in hardcoded borders/shadows
        (r'rgba\(0,\s*209,\s*255,\s*0\.([0-9]+)\)', r'rgba(157, 0, 255, 0.\1)'),
        (r'#00D1FF', '#9D00FF'),
        
        # Re-adjusting text colors back to white/neon if they were set to dark gray
        (r'color:\s*\'#1e1e2d\'', "color: '#FFFFFF'"),
        (r'color:\s*"#1e1e2d"', 'color: "#FFFFFF"')
    ]

    new_content = content
    for pattern, replacement in changes:
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated cyberpunk styles in: {filepath}")

def main():
    src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()

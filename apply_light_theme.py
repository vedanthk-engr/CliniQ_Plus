import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changes = [
        # Convert dark semi-transparent backgrounds to light semi-transparent
        (r'rgba\(15,\s*15,\s*20,\s*0\.[0-9]+\)', 'rgba(255, 255, 255, 0.5)'),
        (r'rgba\(10,\s*10,\s*15,\s*0\.[0-9]+\)', 'rgba(255, 255, 255, 0.45)'),
        (r'rgba\(20,\s*20,\s*25,\s*0\.[0-9]+\)', 'rgba(255, 255, 255, 0.6)'),
        (r'rgba\(20,\s*20,\s*30,\s*0\.[0-9]+\)', 'rgba(255, 255, 255, 0.6)'),
        (r'rgba\(25,\s*25,\s*30,\s*0\.[0-9]+\)', 'rgba(255, 255, 255, 0.65)'),
        (r'rgba\(30,\s*20,\s*50,\s*0\.[0-9]+\)', 'rgba(255, 255, 255, 0.7)'),
        (r'rgba\(25,\s*15,\s*40,\s*0\.[0-9]+\)', 'rgba(255, 255, 255, 0.65)'),
        (r'rgba\(15,\s*12,\s*20,\s*0\.[0-9]+\)', 'rgba(255, 255, 255, 0.5)'),
        
        # Fix white text on light bg -> dark text
        (r"color:\s*'#FFFFFF'", "color: '#1E1E2D'"),
        (r'color:\s*"#FFFFFF"', 'color: "#1E1E2D"'),
        
        # Fix neon green success to dark-friendly green
        (r'#00FF41', '#059669'),
        (r'#FF003C', '#DC2626'),
        (r'#FF0055', '#D97706'),
        
        # Swap neon purple references to the Blue Violet that's visible on light
        (r'#9D00FF', '#8A2BE2'),
        (r'#B026FF', '#9D00FF'),
        
        # Fix option background colors from dark to light
        (r"background:\s*'#0a0a0f'", "background: '#FAFAFF'"),
        (r'background:\s*"#0a0a0f"', 'background: "#FAFAFF"'),
    ]

    new_content = content
    for pattern, replacement in changes:
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Light-themed: {filepath}")

def main():
    src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()

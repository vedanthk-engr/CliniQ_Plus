import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replaces common dark Cliniq backgrounds with a translucent white layer
    # so that the main CSS .glassPanel (which will have a blur & opacity) takes over.
    changes = [
        # Dark Slate Overrides
        (r'rgba\(15,\s*23,\s*42,\s*0\.4\)', 'rgba(255, 255, 255, 0.4)'),
        (r'rgba\(15,\s*23,\s*42,\s*0\.6\)', 'rgba(255, 255, 255, 0.6)'),
        (r'rgba\(15,\s*23,\s*42,\s*1\)', 'rgba(255, 255, 255, 0.9)'),
        (r'rgba\(2,\s*6,\s*23,\s*0\.4\)', 'rgba(255, 255, 255, 0.4)'),
        (r'rgba\(2,\s*6,\s*23,\s*0\.5\)', 'rgba(255, 255, 255, 0.5)'),
        (r'rgba\(2,\s*6,\s*23,\s*0\.8\)', 'rgba(255, 255, 255, 0.8)'),
        
        # Neon Teal texts & borders to Purple/Lavender to match Mindo
        (r'rgba\(0,\s*209,\s*255,\s*0\.05\)', 'rgba(115, 65, 234, 0.05)'),
        (r'rgba\(0,\s*209,\s*255,\s*0\.08\)', 'rgba(115, 65, 234, 0.08)'),
        (r'rgba\(0,\s*209,\s*255,\s*0\.1\)', 'rgba(115, 65, 234, 0.1)'),
        (r'rgba\(0,\s*209,\s*255,\s*0\.2\)', 'rgba(115, 65, 234, 0.2)'),
        (r'#00D1FF', '#7341ea'),
        
        # Adjusting white texts to dark slate since background is now light
        (r'color:\s*\'#fff\'', "color: '#1e1e2d'"),
        (r'color:\s*\'#ffffff\'', "color: '#1e1e2d'"),
        (r'color:\s*"#fff"', 'color: "#1e1e2d"'),
        (r'color:\s*"#ffffff"', 'color: "#1e1e2d"')
    ]

    new_content = content
    for pattern, replacement in changes:
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

def main():
    src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                process_file(os.path.join(root, file))

if __name__ == "__main__":
    main()

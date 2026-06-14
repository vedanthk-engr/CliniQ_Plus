import os
import glob
import sys

if len(sys.argv) < 2:
    print("Usage: python replace_tunnel.py <new_tunnel_url>")
    sys.exit(1)

replacement = sys.argv[1].rstrip('/')

src_dir = r"v:\Project\Cliniq+\src"
files = glob.glob(os.path.join(src_dir, "**", "*.js"), recursive=True) + glob.glob(os.path.join(src_dir, "**", "*.jsx"), recursive=True)

# We want to find whatever URL was previously set and replace it with the new one.
# To do this safely, we will look for any occurrence of .loca.lt, .ngrok-free.app, 
# localhost:8000, or 192.168.1.48:8000 and replace it.
targets = [
    "192.168.1.48:8000",
    "localhost:8000"
]

modified_count = 0

for file_path in files:
    if os.path.isfile(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            original_content = content
            
            # 1. Replace any existing HTTP/HTTPS tunnel formats (e.g., previous loca.lt or ngrok URLs)
            # We search for strings starting with http:// or https:// and ending with loca.lt or ngrok-free.app
            # But to keep it simple, we can extract the base url dynamically or check if common patterns exist
            import re
            content = re.sub(r'https?://[a-zA-Z0-9-]+\.loca\.lt', replacement, content)
            content = re.sub(r'https?://[a-zA-Z0-9-]+\.ngrok-free\.app', replacement, content)
            
            # 2. Also replace IP/localhost targets
            for target in targets:
                content = content.replace("http://" + target, replacement)
                content = content.replace("https://" + target, replacement)
                content = content.replace(target, replacement.replace("https://", "").replace("http://", ""))
            
            if content != original_content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated: {file_path}")
                modified_count += 1
        except Exception as e:
            print(f"Error reading {file_path}: {e}")

print(f"Total files updated: {modified_count}")

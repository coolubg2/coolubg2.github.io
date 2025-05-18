import re
import os

# Path to your pages.js file
pages_js_path = 'pages.js'

# Read the contents of pages.js
with open(pages_js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Regular expression to find all "name" values
name_pattern = re.compile(r'\bname:\s*"([^"]+)"')

# Find all matches
names = name_pattern.findall(content)

# Correct HTML redirect template
html_template = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redirecting...</title>
  <script>
    window.onload = function () {
      const path = window.location.pathname;
      const match = path.match(/\\/games\\/([^\\/]+)\\.html$/);

      if (match && match[1]) {
        const tag = match[1];
        const newUrl = `/games/?${encodeURIComponent(tag)}`;
        window.location.replace(newUrl);
      } else {
        console.error("URL format not recognized.");
      }
    };
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
"""

# Create an HTML file for each name
output_dir = '.'  # change to 'games' or another subfolder if needed
os.makedirs(output_dir, exist_ok=True)

for name in names:
    filename = f"{name}.html"
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_template)
    print(f"Created: {filepath}")


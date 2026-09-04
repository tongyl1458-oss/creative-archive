import re
with open(r'd:\Trae\内容\creative-archive\concepts.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if 'cards' in line and ('const ' in line or 'var ' in line or 'let ' in line):
        print(f'L{i}: {line.rstrip()[:120]}')

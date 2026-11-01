#!/bin/bash
# Сжатие лётчика: meshopt (геометрия и анимации), текстуры webp ≤1024, без упрощения сетки.
# szhat.sh вход.glb выход.glb
set -e
npx -y @gltf-transform/cli@4 optimize "$1" "$2" --compress meshopt --texture-compress webp --texture-size 1024 --simplify false
npx -y @gltf-transform/cli@4 inspect "$2" --format md 2>/dev/null | grep -E "^\| (name|[A-Za-z_]+_Loop|.*webp)" | head -40 || true
ls -la "$2"

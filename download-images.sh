#!/bin/sh
# Roblox дээрх тоглоом бүрийн ЭХНИЙ thumbnail-ийг assets/img/ руу .webp (768x432) болгон татна.
# Ажиллуулах: sh download-images.sh   (repo-гийн үндэс хавтас дотор; curl хэрэгтэй)
# Анхаар: Roblox дээр тоглоомын эхний thumbnail-ийг солих бүрт энэ скриптийг дахин ажиллуулж, зургуудаа commit хийнэ.
#         (Одоогийн troll-tower.webp нь 3 дахь thumbnail буюу троллын нүүртэй зураг. Halloween зураг ирвэл түүгээр солигдоно.)
set -e
mkdir -p assets/img
get() { # $1 universe id, $2 file name
  url=$(curl -fsS "https://thumbnails.roblox.com/v1/games/multiget/thumbnails?universeIds=$1&countPerUniverse=1&size=768x432&format=Webp" \
        | sed -n 's/.*"imageUrl":"\([^"]*\)".*/\1/p')
  [ -n "$url" ] || { echo "Олдсонгүй: $2"; return 1; }
  curl -fsSL -o "assets/img/$2" "$url" && echo "OK $2"
}
get 7606658236 troll-tower.webp
get 8509544802 hangout.webp
get 7883093131 troll-tower-2.webp
get 7717729199 slap-tower.webp
echo 'Дууслаа. assets/img/ доторх зургуудыг commit хийнэ үү.'

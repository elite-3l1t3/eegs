#!/bin/sh
# Roblox-ийн тоглоомын зургуудыг өөрийн repo руу хадгалах (assets/img/).
# Ажиллуулах: sh download-images.sh   (repo-гийн үндэс хавтас дотор)
mkdir -p assets/img
curl -L -o assets/img/troll-tower.jpg 'https://tr.rbxcdn.com/180DAY-92fea9ba40f43c50b08a85734cb1fe89/500/280/Image/Jpeg/noFilter'
curl -L -o assets/img/hangout.jpg 'https://tr.rbxcdn.com/180DAY-63b055c5423e2be081bd549df782aa57/500/280/Image/Jpeg/noFilter'
curl -L -o assets/img/troll-tower-2.jpg 'https://tr.rbxcdn.com/180DAY-1035620ebb72ea235b58feeb40b082c6/500/280/Image/Jpeg/noFilter'
curl -L -o assets/img/slap-tower.jpg 'https://tr.rbxcdn.com/180DAY-0075c473c95202cdabd836f714fe434d/500/280/Image/Jpeg/noFilter'
curl -L -o assets/img/event.jpg 'https://tr.rbxcdn.com/180DAY-baac2d85950a8e83685cc85f53242e99/768/432/Image/Jpeg/noFilter'
echo 'Дууслаа. assets/img/ доторх зургуудыг commit хийнэ үү.'

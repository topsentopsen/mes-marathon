# Pixel-Portrait von Christian: ca. 40 Jahre, sehr viel graues Haar (volle Frisur, graue Schläfen), kein Bart, Hemd mit Kragen. 32x32, selbst gezeichnet (v0.2: vollere Haare, Lachfältchen).
from PIL import Image
PAL = {'.':(29,78,90),'o':(26,26,36),'H':(190,190,192),'h':(150,150,154),'d':(92,86,82),
 'S':(236,190,150),'s':(204,152,112),'e':(40,30,30),'w':(244,240,234),'b':(110,104,100),
 'm':(160,80,72),'B':(140,184,232),'C':(214,232,250),'D':(100,146,200),'K':(250,250,250),'n':(214,166,128)}
ROWS = [
 "",
 "oooooooooo",
 "ooHHHHhHHHHHoo",
 "oHHHhHHHHHHHHHHo",
 "oHHHHHHhHHHHdHHHHo",
 "oHHhHHHHHHHHdHHHHo",
 "oHHHHdHHHHHHHhHHHo",
 "oHhHHHHHHhHHHHHdHo",
 "oHHSSSSSSSSSSSSHHo",
 "oHSSSSSSSSSSSSSSHo",
 "oHSbbbSSSSSSbbbSHo",
 "sSSSSSSSSSSSSSSSSs",
 "sSsSwweSSSSewwSsSs",
 "sSSSSSSSnSSSSSSSSs",
 "sSSSSSSSnnSSSSSSSs",
 "oSSSSSSsnnsSSSSSSo",
 "oSSSSmSSSSSSSmSSSo",
 "oSSSSSmmmmmmmSSSSo",
 "osSSSSSSSSSSSSSSso",
 "osSSSSSSSSSSSSso",
 "ossSSSSSSSSsso",
 "oSSSSSSSSo",
 "CCoSSSSSSoCC",
 "BBCCCsSSSSsCCCBB",
 "BBBBBCCsSSsCCBBBBB",
 "BBBBBBBCCssCCBBBBBBB",
 "DBBBBBBBBCKCCBBBBBBBBD",
 "DBBBBBBBBBBBDBBBBBBBBBBD",
 "DDBBBBBBBBBBBKBBBBBBBBBBBBDD",
 "DDBBBBBBBBBBBBDBBBBBBBBBBBBBDD",
 "DDDBBBBBBBBBBBBKBBBBBBBBBBBBBDDD",
 "DDDBBBBBBBBBBBBDBBBBBBBBBBBBBDDD",
]
img = Image.new('RGB',(32,32),PAL['.'])
for y,r in enumerate(ROWS[:32]):
    off=(32-len(r))//2
    for i,c in enumerate(r): img.putpixel((off+i,y),PAL[c])
img.save('img/portrait-32.png')
img.resize((256,256),Image.NEAREST).save('img/portrait.png')
img.save('favicon.ico',sizes=[(16,16),(32,32)])
img.resize((180,180),Image.NEAREST).save('img/apple-touch-icon.png')
print('ok')

"""Госкаталог для помощников. 
  gk.py q "запрос" [n]            — кандидаты: id | название | музей | размер фото
  gk.py list МУЗЕЙ [от] [до]      — кадры музея на замену (строки data/r90-na-razreshenie.tsv, без дублей)
  gk.py sheet out.jpg id1 id2 ... — лист картинок с подписями (id) — смотреть Read-ом
  gk.py get id out.jpg            — скачать оригинал предмета
"""
import sys, io, csv, json
sys.path.insert(0,'/home/agent/rc-wt/zamena/scripts'); sys.path.insert(0,'/home/agent/rc-wt/zamena/scripts/fondy')
import goskatalog as g, _set
import threading
_set.PROXY_S=60; _set._put['goskatalog.ru']='proxy'   # напрямую Госкаталог закрыт — сразу узел, ждать до 60 с
_poisk0=g.poisk
def _povtor(f,*x):
    for k in range(3):
        try: return f(*x)
        except Exception:
            _set._put['goskatalog.ru']='proxy'
            if k==2: raise
            threading.Event().wait(3*(k+1))
g.poisk=lambda q,n=20: _povtor(_poisk0,q,n)
from PIL import Image, ImageDraw, ImageFont
F=ImageFont.truetype('/home/agent/.local/share/fonts/DejaVuSerif.ttf',18)
def card(i): return g._open(f'/muzfo-rest/rest/exhibits/{i}')
def img_id(o):
    ims=o.get('images') or []
    return next((x['id'] for x in ims if x.get('main')), ims[0]['id'] if ims else None)
def raw(i):
    o=_povtor(card,i); m=img_id(o)
    if not m: return o,None
    r=_set.zapros(g._S,'GET',f'{g.GK}/muzfo-imaginator/rest/images/original/{m}',proxy=g._kadr.RU_PROXY)
    return o,r.content
a=sys.argv
if a[1]=='q':
    for o in g.poisk(a[2], int(a[3]) if len(a)>3 else 10):
        print(o['id'],'|',(o.get('name') or '')[:110].replace('\n',' '),'|',g.muzey(o.get('museumId'))[-70:],'|','фото' if o.get('mainImage') else 'БЕЗ ФОТО')
elif a[1]=='list':
    rows=[r for r in csv.reader(open('/home/agent/rc-wt/zamena/data/r90-na-razreshenie.tsv'),delimiter='\t') if r and r[0]==a[2]]
    seen=set(); out=[]
    for r in rows:
        if r[2] in seen: continue
        seen.add(r[2]); out.append(r)
    lo=int(a[3]) if len(a)>3 else 0; hi=int(a[4]) if len(a)>4 else len(out)
    print('всего уникальных:',len(out))
    for n,r in enumerate(out[lo:hi],lo): print(n,'\t'.join(r[1:]))
elif a[1]=='get':
    o,b=raw(a[2]); open(a[3],'wb').write(b); im=Image.open(a[3]); print(im.size, g.muzey(o.get('museumId')), o.get('name','')[:150], 'инв:',o.get('invNumber'))
elif a[1]=='sheet':
    ids=a[3:]; W=320; cols=4; rows=(len(ids)+cols-1)//cols
    sh=Image.new('RGB',(W*cols,(W+50)*rows),'white'); d=ImageDraw.Draw(sh)
    for n,i in enumerate(ids):
        x,y=(n%cols)*W,(n//cols)*(W+50)
        try:
            o,b=raw(i); im=Image.open(io.BytesIO(b)).convert('RGB'); sz=im.size; im.thumbnail((W-10,W-10)); sh.paste(im,(x+5,y+5))
            d.text((x+5,y+W),f'{i} {sz[0]}x{sz[1]}',fill='black',font=F)
        except Exception as e: d.text((x+5,y+W),f'{i} ОШИБКА',fill='red',font=F)
    sh.save(a[2],quality=80); print('ok',a[2])

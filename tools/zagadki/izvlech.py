import yaml,re,html,sys,glob,os
def clean(s): return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>','',str(s)))).strip()
def lines(d):
    out=[]
    L=d.get('lead',{}); out.append(('lead.h1',L.get('h1'))); out.append(('lead.hook',L.get('hook'))); out.append(('lead.privyazka',L.get('privyazka'))); out.append(('lead.kto',L.get('kto')))
    for i,s in enumerate(d.get('stamp') or []): out.append((f'stamp[{i}]',f"{s.get('v')} — {s.get('k')}"))
    for i,u in enumerate((d.get('story') or {}).get('udary') or []):
        out.append((f'story[{i}].summary',u.get('summary')))
        for j,t in enumerate(u.get('det') or []): out.append((f'story[{i}].det[{j}]',t))
        out.append((f'story[{i}].src',u.get('src')))
    for b,blk in enumerate(d.get('fakty') or []):
        for i,u in enumerate(blk.get('udary') or []):
            out.append((f'fakty[{b}][{i}].summary',u.get('summary')))
            for j,t in enumerate(u.get('det') or []): out.append((f'fakty[{b}][{i}].det[{j}]',t))
            out.append((f'fakty[{b}][{i}].src',u.get('src')))
    p=d.get('pervenstvo') or {}
    out.append(('pervenstvo.granica',p.get('granica'))); out.append(('pervenstvo.net',p.get('net')))
    for i,r in enumerate(p.get('stroki') or []): out.append((f'pervenstvo.stroki[{i}]',' | '.join(map(str,r))))
    return [(k,clean(v)) for k,v in out if v]
if __name__=='__main__':
    for f in sorted(glob.glob('src/content/dni-shablon/izobreteniya/01-*.yaml')):
        d=yaml.safe_load(open(f)); k=os.path.basename(f)[:5]
        with open(f'/tmp/r569/fakty/{k}.txt','w') as o:
            o.write(f"# {k} · {clean(d['lead'].get('h1'))} · {clean(d.get('kroshka'))}\n")
            for a,b in lines(d): o.write(f"[{a}] {b}\n")

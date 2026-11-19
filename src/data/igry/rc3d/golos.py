#!/usr/bin/env python3
# rc3d · Голос сценария: все события {"do":"voice","file":…,"text":…} → zvuk/<file>.mp3 рядом со сценарием.
# Синтез gTTS (lang=ru), затем «громкая связь» ffmpeg: обрезка тишины, ускорение, полоса 320–3400 Гц, компрессор,
# короткое эхо площадки, лимитер; mp3 24 кГц 40 кбит/с. Запуск: ~/.venvs/agent/bin/python golos.py scen/<имя>.json
import json, os, subprocess, sys, tempfile
from gtts import gTTS

FF = os.environ.get('FFMPEG', '/home/agent/bin/ffmpeg')
CHAIN = ('silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,'
         'atempo=1.15,highpass=f=320,lowpass=f=3400,acompressor=threshold=-18dB:ratio=4:attack=5:release=80,'
         'aecho=0.8:0.5:45:0.22,alimiter=limit=0.9')

def walk(sc):
    tls = [sc.get('zastavka', {}).get('timeline', [])]
    for o in sc.get('igra', {}).get('outcomes', []): tls.append(o.get('timeline', []))
    for c in sc.get('igra', {}).get('choices', []):
        for op in c['options']: tls.append(op.get('setup', []))
    for tl in tls:
        for e in tl:
            if e.get('do') == 'voice' and e.get('text'): yield e['file'], e['text']

path = sys.argv[1]; sc = json.load(open(path))
out = os.path.join(os.path.dirname(path), os.path.splitext(os.path.basename(path))[0], 'zvuk'); os.makedirs(out, exist_ok=True)
done = {}
for f, text in walk(sc):
    if f in done: continue
    done[f] = text
    dst = os.path.join(out, f + '.mp3')
    if os.path.exists(dst) and '--force' not in sys.argv: continue
    with tempfile.NamedTemporaryFile(suffix='.mp3') as raw:
        gTTS(text, lang='ru').save(raw.name)
        subprocess.run([FF, '-loglevel', 'error', '-y', '-i', raw.name, '-af', CHAIN, '-ar', '24000', '-ac', '1', '-b:a', '40k', dst], check=True)
    print(f, '←', text)
print('голосов:', len(done), '→', out)

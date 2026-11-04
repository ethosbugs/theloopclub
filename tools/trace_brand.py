"""Regenera assets/brand-paths.js a partir de brand/estrella.png (estrella azul sobre fondo blanco)
y brand/loop-logo.png (LOOP blanco sobre fondo azul). Ejecutar desde la raíz del proyecto:
    pip install opencv-python numpy
    python tools/trace_brand.py
"""
import cv2, numpy as np, json, sys
import sys,os
A=''  # rutas relativas a la carpeta del proyecto
def contours(img_path, dark_is_fg):
    g=cv2.cvtColor(cv2.imread(img_path),cv2.COLOR_BGR2GRAY)
    g=cv2.GaussianBlur(g,(3,3),0)
    m=(g<128) if dark_is_fg else (g>128)
    m=m.astype(np.uint8)*255
    cs,h=cv2.findContours(m,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
    return cs,h[0],m
def smooth_path(c, step=5):
    pts=c[:,0,:].astype(float)
    n=len(pts)
    # remuestreo cada `step` px y suavizado leve
    idx=np.arange(0,n,step); p=pts[idx]
    k=np.array([.25,.5,.25]); 
    p=np.stack([np.convolve(np.r_[p[-1:,i],p[:,i],p[:1,i]],k,'valid') for i in range(2)],1)
    m=len(p); d=''
    d+=f'M{p[0][0]:.1f} {p[0][1]:.1f}'
    for i in range(m):
        p0=p[(i-1)%m];p1=p[i];p2=p[(i+1)%m];p3=p[(i+2)%m]
        c1=p1+(p2-p0)/6;c2=p2-(p3-p1)/6
        d+=f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}'
    return d+'Z'
def info(c):
    x,y,w,h=cv2.boundingRect(c); M=cv2.moments(c); return dict(x=x,y=y,w=w,h=h,cx=M['m10']/M['m00'],cy=M['m01']/M['m00'],area=cv2.contourArea(c))
out={}
# ---- estrella (fondo blanco, estrella azul) ----
cs,h,m=contours('brand/estrella.png',True)
big=max(range(len(cs)),key=lambda i:cv2.contourArea(cs[i]))
body=cs[big]; out['star']={'body':smooth_path(body,6),'bbox':info(body)}
eyes=[]
for i,c in enumerate(cs):
    if h[i][3]==big: eyes.append(i)   # agujeros blancos (ojos)
eyes.sort(key=lambda i:info(cs[i])['cx'])
out['star']['eyes']=[]
for i in eyes:
    e=cs[i]; ei=info(e)
    # pupila: contorno exterior hijo-del-agujero
    pu=[j for j in range(len(cs)) if j!=big and h[j][3]==-1 and cv2.pointPolygonTest(e,(float(info(cs[j])['cx']),float(info(cs[j])['cy'])),False)>0]
    pj=max(pu,key=lambda j:cv2.contourArea(cs[j])) if pu else None
    out['star']['eyes'].append({'outer':smooth_path(e,3),'info':ei,'pupil':smooth_path(cs[pj],3) if pj is not None else None,'pinfo':info(cs[pj]) if pj is not None else None})
# radio inscrito desde el punto medio de los ojos
ecx=np.mean([e['info']['cx'] for e in out['star']['eyes']]); ecy=np.mean([e['info']['cy'] for e in out['star']['eyes']])
d=min(abs(cv2.pointPolygonTest(body,(float(ecx),float(ecy)),True)),1e9)
out['star']['anchor']=[ecx,ecy]; out['star']['rin']=d
# ---- LOOP (fondo azul, letras blancas) ----
cs,h,m=contours('brand/loop-logo.png',False)
glyphs=[];holes=[]
for i,c in enumerate(cs):
    if cv2.contourArea(c)<200: continue
    (holes if h[i][3]!=-1 else glyphs).append(i)
glyphs.sort(key=lambda i:info(cs[i])['cx'])
L=[]
for gi in glyphs:
    gh=[j for j in holes if h[j][3]==gi]
    L.append({'outer':smooth_path(cs[gi],5),'info':info(cs[gi]),'holes':[smooth_path(cs[j],4) for j in gh],'hinfo':[info(cs[j]) for j in gh]})
out['loop']=L
x0=min(g['info']['x'] for g in L);x1=max(g['info']['x']+g['info']['w'] for g in L);y0=min(g['info']['y'] for g in L);y1=max(g['info']['y']+g['info']['h'] for g in L)
out['loopbox']=[x0,y0,x1,y1]
print('star bbox',out['star']['bbox']);print('eyes',[ (e['info']['cx'],e['info']['cy'],e['info']['w'],e['info']['h']) for e in out['star']['eyes']]);print('rin',d)
print('loop glyphs',[(g['info']['cx'],g['info']['cy'],g['info']['w'],g['info']['h'],len(g['holes'])) for g in L]);print('box',out['loopbox'])
import os
js='// Generado desde las imágenes oficiales (estrella y logotipo LOOP) por vectorización de contornos.\nexport const BRAND='+json.dumps(out,separators=(',',':'))+';\n'
open('assets/brand-paths.js','w').write(js); print(len(js)//1024,'KB')

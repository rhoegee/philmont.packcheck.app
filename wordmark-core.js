// Packcheck wordmark — shared rendering core. One locked spec, many instances.
(function(){
const NS='http://www.w3.org/2000/svg';
const COL={cream:'#f4ecd8',pine:'#2e4a39',scout:'#c5172b',white:'#ffffff',char:'#1c1c1a'};
const SPEC={wall:4.5, chScale:0.78};
const FS=100, baseY=110;

// scout check shape (solid), built once in 1000-em space
const SCOUT=(function(){
  const capY=340, baseY=1149, TH=54*Math.PI/180;
  const d={x:Math.cos(TH),y:-Math.sin(TH)}, upLeft={x:d.y,y:-d.x};
  const sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y}),add=(a,b)=>({x:a.x+b.x,y:a.y+b.y}),mul=(a,s)=>({x:a.x*s,y:a.y*s});
  const ul=a=>Math.hypot(a.x,a.y),unit=a=>mul(a,1/ul(a));
  function inter(P0,d0,P1,d1){const den=d0.x*d1.y-d0.y*d1.x;const r=sub(P1,P0);const t=(r.x*d1.y-r.y*d1.x)/den;return add(P0,mul(d0,t));}
  function atY(P0,dir,y){return add(P0,mul(dir,(y-P0.y)/dir.y));}
  const TO={x:4756,y:693},BO={x:4913,y:baseY+8};
  const outerDir=unit(sub(BO,TO)),W=172.3,innerEdgePt=add(BO,mul(upLeft,W));
  const CP=inter(innerEdgePt,d,TO,outerDir);
  const IT=add(innerEdgePt,mul(d,(capY-innerEdgePt.y)/d.y));
  const OT=add(BO,mul(d,(capY-BO.y)/d.y));
  const leftNormal={x:-outerDir.y,y:outerDir.x};
  const Ei=add(TO,mul(leftNormal,W));
  const BI_even=atY(Ei,outerDir,baseY+8);
  const pts=[Ei,TO,CP,IT,OT,BO,BI_even];
  const cb={minX:Math.min(...pts.map(p=>p.x)),maxX:Math.max(...pts.map(p=>p.x)),
            minY:Math.min(...pts.map(p=>p.y)),maxY:Math.max(...pts.map(p=>p.y))};
  cb.w=cb.maxX-cb.minX; cb.h=cb.maxY-cb.minY;
  const dstr='M'+pts.map(p=>p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' L')+' Z';
  return {d:dstr, cb};
})();

let capH, capTop, boxOuterRightX;

function el(name,attrs){const e=document.createElementNS(NS,name);for(const k in attrs)e.setAttribute(k,attrs[k]);return e;}

function checkInBox(svg,outerLeft,outerTop,outer,checkColor){
  const f=capH/(capH+SPEC.wall), wall=SPEC.wall*f, geom=outer-wall;
  svg.appendChild(el('rect',{x:(outerLeft+wall/2).toFixed(2),y:(outerTop+wall/2).toFixed(2),
    width:geom.toFixed(2),height:geom.toFixed(2),fill:'none',stroke:'__BOX__',
    'stroke-width':wall.toFixed(3)}));
  const cb=SCOUT.cb, chH=outer*SPEC.chScale*f, s=chH/cb.h;
  const ccx=outerLeft+outer/2, ccy=outerTop+outer/2;
  const tx=ccx-(cb.minX+cb.w/2)*s, ty=ccy-(cb.minY+cb.h/2)*s;
  svg.appendChild(el('path',{d:SCOUT.d,fill:checkColor,
    transform:`translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`}));
  return {wall,geom};
}

function drawLockup(svg,c){
  const t=el('text',{x:'0',y:baseY,'font-family':'Oswald','font-weight':'700','font-size':FS,fill:c.word});
  t.textContent='PACKCHECK'; svg.appendChild(t);
  const wW=t.getComputedTextLength();
  const outer=capH, outerRight=boxOuterRightX, outerLeft=outerRight-outer, outerTop=capTop;
  const r=checkInBox(svg,outerLeft,outerTop,outer,c.check);
  svg.querySelector('rect').setAttribute('stroke',c.box);
  const pad=14, leftMost=outerLeft-pad, topMost=capTop-pad;
  svg.setAttribute('viewBox',`${leftMost.toFixed(1)} ${topMost.toFixed(1)} ${(wW-leftMost+pad).toFixed(1)} ${(capH+2*pad).toFixed(1)}`);
  return {wW,outerLeft};
}

function drawSymbol(svg,c){
  const outer=capH, pad=outer*0.05;
  checkInBox(svg,0,0,outer,c.check);
  svg.querySelector('rect').setAttribute('stroke',c.box);
  svg.setAttribute('viewBox',`${(-pad).toFixed(1)} ${(-pad).toFixed(1)} ${(outer+2*pad).toFixed(1)} ${(outer+2*pad).toFixed(1)}`);
}

function drawClearspace(svg){
  const c={word:COL.pine,box:COL.pine,check:COL.scout};
  const {wW,outerLeft}=drawLockup(svg,c);
  const X=capH;                                   // clear-space unit = the checkbox
  const left=outerLeft, right=wW, top=capTop, bot=baseY;
  // dashed clear-space frame, one X on each side
  svg.appendChild(el('rect',{x:(left-X).toFixed(1),y:(top-X).toFixed(1),
    width:(right-left+2*X).toFixed(1),height:(bot-top+2*X).toFixed(1),
    fill:'none',stroke:'#b9533f','stroke-width':'1.4','stroke-dasharray':'7 6',opacity:'0.7'}));
  // small X swatch (one checkbox outline) bottom-left of the field, as the legend
  const sx=left-X+6, sy=bot+X-X*0.34-6, ss=X*0.34;
  svg.appendChild(el('rect',{x:sx.toFixed(1),y:sy.toFixed(1),width:ss.toFixed(1),height:ss.toFixed(1),
    fill:'none',stroke:'#b9533f','stroke-width':'1.2'}));
  const lab=el('text',{x:(sx+ss+5).toFixed(1),y:(sy+ss*0.78).toFixed(1),'font-family':'JetBrains Mono','font-size':(ss*0.8).toFixed(1),fill:'#b9533f'});
  lab.textContent='= X'; svg.appendChild(lab);
  const pad=10;
  svg.setAttribute('viewBox',`${(left-X-pad).toFixed(1)} ${(top-X-pad).toFixed(1)} ${(right-left+2*X+2*pad).toFixed(1)} ${(bot-top+2*X+2*pad).toFixed(1)}`);
}

function colorsFrom(svg){
  return {word:COL[svg.dataset.w]||COL.pine, box:COL[svg.dataset.b]||COL.pine, check:COL[svg.dataset.c]||COL.scout};
}

function render(){
  const cx=document.createElement('canvas').getContext('2d');
  cx.font='700 '+FS+'px "Oswald"';
  capH=cx.measureText('H').actualBoundingBoxAscent; capTop=baseY-capH;
  const xH_right=cx.measureText('PACKCH').actualBoundingBoxRight;
  const xE_left =cx.measureText('PACKCH').width + (-cx.measureText('E').actualBoundingBoxLeft);
  const HE_gap=xE_left-xH_right;
  const P_inkLeft=-cx.measureText('PACKCHECK').actualBoundingBoxLeft;
  boxOuterRightX = P_inkLeft - HE_gap;

  // clearspace special
  const cs=document.getElementById('clearspace'); if(cs) drawClearspace(cs);

  document.querySelectorAll('svg[data-mark]').forEach(svg=>{
    svg.innerHTML='';
    const kind=svg.dataset.mark;
    if(kind==='word') drawLockup(svg,colorsFrom(svg));
    else if(kind==='sym') drawSymbol(svg,colorsFrom(svg));
    if(svg.dataset.px){
      const px=+svg.dataset.px;
      if(kind==='sym'){ svg.style.width=px+'px'; svg.style.height=px+'px'; }
      else { svg.style.width=px+'px'; svg.style.height='auto'; }
    }
  });
}

window.PCWordmark={render};
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(render);
})();

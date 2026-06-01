/* Packcheck — icon render core (plain JS port of the locked icon library).
   Monoline glyphs on a 100x100 viewBox. {base, accent, solid?}.
   base = charcoal/treatment lines · accent = scout red detail · solid = filled caps. */
(function(){
const COL={pine:'#2e4a39',pineDeep:'#243b2d',scout:'#c5172b',gold:'#d6a93f',
  canvas:'#d8c39e',cream:'#f4ecd8',paper:'#efe6cf',charcoal:'#1c1c1a',ink:'#5d5240'};

const ICONS={
  pack:{base:`<path d="M34 40 a16 16 0 0 1 32 0 V78 a4 4 0 0 1 -4 4 H38 a4 4 0 0 1 -4 -4 Z"/><path d="M37 52 q13 -8 26 0"/><path d="M43 38 q-1 -13 7 -15"/><path d="M57 38 q1 -13 -7 -15"/>`,
        accent:`<rect x="41" y="60" width="18" height="18" rx="4"/>`},
  sleep:{base:`<rect x="36" y="22" width="28" height="60" rx="9"/>`,
        solid:`<path d="M36 34 V31 a9 9 0 0 1 9 -9 H55 a9 9 0 0 1 9 9 V34 Z"/><path d="M36 70 V73 a9 9 0 0 0 9 9 H55 a9 9 0 0 0 9 -9 V70 Z"/>`,
        accent:`<line x1="50" y1="22" x2="50" y2="82"/><rect x="46" y="48" width="8" height="8" rx="1"/>`},
  poles:{base:`<path d="M40 32 V80"/><path d="M60 32 V80"/><circle cx="40" cy="29" r="3"/><circle cx="60" cy="29" r="3"/><path d="M37 72 H43"/><path d="M57 72 H63"/>`,
        accent:`<path d="M40 32 q-10 3 -8 12"/><path d="M60 32 q10 3 8 12"/>`},
  jacket:{base:`<path d="M37 32 H63 L64 82 H54 L50 46 L46 82 H36 Z"/>`,
        accent:`<line x1="37" y1="35" x2="63" y2="35"/><rect x="47" y="32.5" width="6" height="5" rx="1"/>`},
  rain:{base:`<path d="M24 52 a26 26 0 0 1 52 0 Z"/><path d="M24 52 q13 -9 26 0 q13 -9 26 0"/><path d="M50 52 V74"/><path d="M50 74 a6 6 0 0 1 -11 1"/>`,
        accent:`<line x1="63" y1="60" x2="59" y2="70"/><line x1="73" y1="64" x2="70" y2="74"/>`},
  soap:{base:`<rect x="28" y="48" width="40" height="26" rx="9"/>`,
        accent:`<circle cx="64" cy="38" r="5"/><circle cx="76" cy="46" r="3"/>`},
  food:{base:`<rect x="34" y="34" width="32" height="46" rx="3"/><ellipse cx="50" cy="34" rx="16" ry="5"/>`,
        accent:`<line x1="36" y1="54" x2="64" y2="54"/><line x1="36" y1="62" x2="64" y2="62"/>`},
  bottle:{base:`<path d="M42 32 H58 V40 a6 6 0 0 1 4 6 V74 a6 6 0 0 1 -6 6 H42 a6 6 0 0 1 -6 -6 V46 a6 6 0 0 1 4 -6 Z"/><rect x="42" y="22" width="16" height="10" rx="2"/>`,
        accent:`<line x1="36" y1="58" x2="64" y2="58"/>`},
  knife:{base:`<rect x="20" y="57" width="42" height="16" rx="8"/><path d="M57 57 L87 43 C90 47 89 52 85 54 L59 70 Z"/>`,
        accent:`<circle cx="57" cy="65" r="3"/>`},
  tent:{base:`<line x1="12" y1="78" x2="88" y2="78"/><line x1="50" y1="24" x2="18" y2="78"/><line x1="50" y1="24" x2="82" y2="78"/>`,
        accent:`<path d="M50 78 L40 78 L50 52 Z"/>`},
  cook:{base:`<path d="M34 47 V77 a5 5 0 0 0 5 5 H61 a5 5 0 0 0 5 -5 V47 Z"/><line x1="30" y1="47" x2="70" y2="47"/>`,
        accent:`<path d="M37 46 C35 27 65 27 63 46"/><circle cx="37" cy="46" r="2"/><circle cx="63" cy="46" r="2"/>`},
  bear:{base:`<circle cx="50" cy="55" r="23"/><circle cx="33" cy="36" r="9"/><circle cx="67" cy="36" r="9"/>`,
        accent:`<ellipse cx="50" cy="62" rx="11" ry="8"/><line x1="50" y1="57" x2="50" y2="60"/>`},
  compass:{base:`<circle cx="50" cy="52" r="28"/><path d="M50 70 L43 53 L57 53 Z"/>`,
        accent:`<path d="M50 34 L57 53 L43 53 Z"/>`},
  trowel:{base:`<line x1="50" y1="22" x2="50" y2="44"/><line x1="44" y1="22" x2="56" y2="22"/><path d="M38 44 H62 L50 78 Z"/>`,
        accent:`<line x1="50" y1="50" x2="50" y2="72"/>`},
  tape:{base:`<ellipse cx="50" cy="40" rx="22" ry="8"/><line x1="28" y1="40" x2="28" y2="60"/><line x1="72" y1="40" x2="72" y2="60"/><path d="M28 60 a22 8 0 0 0 44 0"/><ellipse cx="50" cy="40" rx="9" ry="3"/>`,
        accent:`<path d="M72 53 q10 2 9 13 l-7 -2"/>`},
  fuel:{base:`<path d="M40 22 L60 22 L57 64 Q56 69 50 69 Q44 69 43 64 Z"/><line x1="40" y1="22" x2="60" y2="22"/><rect x="44" y="69" width="12" height="12" rx="2"/>`,
        accent:`<line x1="42" y1="40" x2="58" y2="40"/>`},
  box:{base:`<path d="M26 44 L50 34 L74 44 L74 70 L50 80 L26 70 Z"/><path d="M26 44 L50 54 L74 44"/><path d="M50 54 V80"/>`,
        accent:`<path d="M40 41 L50 45 L60 41"/>`},
  chair:{base:`<path d="M30 42 Q31 62 41 65 L59 65 Q69 62 70 42"/><path d="M41 65 L70 88"/><path d="M59 65 L30 88"/>`,
        accent:`<path d="M30 42 Q50 33 70 42"/>`},
  checkbox:{base:`<rect x="22" y="22" width="56" height="56" rx="4"/>`,
        accent:`<path d="M33 52 L46 65 L69 35"/>`},
};

// treatment configs (the three locked directions)
const TREAT={
  A:{name:'Trail Monoline', ic:COL.charcoal, ac:COL.scout, bw:6,
     tile:{background:'#fff', border:'1px solid rgba(28,28,26,.14)', radius:11}},
  B:{name:'Camp Badge', ic:COL.cream, ac:COL.scout, bw:6,
     tile:{background:COL.pine, border:'1px solid rgba(214,169,63,.55)', radius:21,
       shadow:'inset 0 0 0 3px '+COL.pine+', inset 0 0 0 4px rgba(214,169,63,.4)'}},
  C:{name:'Field Two-Tone', ic:COL.charcoal, ac:COL.scout, bw:7,
     tile:{background:COL.canvas, border:'1px solid rgba(28,28,26,.2)', radius:14}},
};

// raw glyph svg string. opts: {ic, ac, bw, size}
function glyph(key,opts){
  const d=ICONS[key]; if(!d) return '';
  const o=Object.assign({ic:COL.charcoal,ac:COL.scout,bw:6,size:52},opts);
  return `<svg viewBox="0 0 100 100" width="${o.size}" height="${o.size}" style="display:block">`+
    `<g fill="none" stroke="${o.ic}" stroke-width="${o.bw}" stroke-linecap="round" stroke-linejoin="round">${d.base}</g>`+
    (d.solid?`<g fill="${o.ic}" stroke="none">${d.solid}</g>`:'')+
    `<g fill="none" stroke="${o.ac}" stroke-width="${o.bw}" stroke-linecap="round" stroke-linejoin="round">${d.accent}</g>`+
    `</svg>`;
}

// glyph inside its treatment tile. t = 'A'|'B'|'C'. tileSize / iconSize override defaults
function tile(key,t,tileSize,iconSize){
  const cfg=TREAT[t]||TREAT.B; const ts=tileSize||84, is=iconSize||Math.round(ts*0.62);
  const st=cfg.tile;
  const css=`width:${ts}px;height:${ts}px;display:flex;align-items:center;justify-content:center;`+
    `background:${st.background};border:${st.border};border-radius:${st.radius}px;`+
    (st.shadow?`box-shadow:${st.shadow};`:'');
  return `<div style="${css}">${glyph(key,{ic:cfg.ic,ac:cfg.ac,bw:cfg.bw,size:is})}</div>`;
}

window.PCIcon={glyph,tile,ICONS,TREAT,COL,
  keys:Object.keys(ICONS)};
})();

/* =============================================
   FANCY FONT GENERATOR — app.js
   Converts text to 100+ Unicode font styles
   ============================================= */

// ── Unicode offset maps ──────────────────────────────────────────────────────
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS    = '0123456789';

function charMap(upStart, loStart, digStart) {
  const m = {};
  for (let i = 0; i < 26; i++) {
    m[UPPERCASE[i]] = String.fromCodePoint(upStart + i);
    m[LOWERCASE[i]] = String.fromCodePoint(loStart + i);
  }
  if (digStart !== undefined) {
    for (let i = 0; i < 10; i++) m[DIGITS[i]] = String.fromCodePoint(digStart + i);
  }
  return m;
}

function applyMap(text, map, fallback) {
  return [...text].map(c => map[c] ?? (fallback ? c : c)).join('');
}

// ── Combining character decorators ───────────────────────────────────────────
function combineChars(text, combiner) {
  return [...text].map(c => c === ' ' ? ' ' : c + combiner).join('');
}

// ── Fullwidth map ─────────────────────────────────────────────────────────────
const fullwidthMap = {};
for (let i = 0; i < 26; i++) {
  fullwidthMap[UPPERCASE[i]] = String.fromCodePoint(0xFF21 + i);
  fullwidthMap[LOWERCASE[i]] = String.fromCodePoint(0xFF41 + i);
}
for (let i = 0; i < 10; i++) fullwidthMap[DIGITS[i]] = String.fromCodePoint(0xFF10 + i);

// ── Circled letters ───────────────────────────────────────────────────────────
const circledMap = {};
for (let i = 0; i < 26; i++) {
  circledMap[UPPERCASE[i]] = String.fromCodePoint(0x24B6 + i);
  circledMap[LOWERCASE[i]] = String.fromCodePoint(0x24D0 + i);
}
for (let i = 0; i < 10; i++) circledMap[DIGITS[i]] = i === 0 ? '⓪' : String.fromCodePoint(0x2460 + i - 1);

// ── Negative circled ──────────────────────────────────────────────────────────
const negCircledMap = {};
for (let i = 0; i < 26; i++) negCircledMap[UPPERCASE[i]] = String.fromCodePoint(0x1F150 + i);
// lowercase fallback to upper negcircled
for (let i = 0; i < 26; i++) negCircledMap[LOWERCASE[i]] = String.fromCodePoint(0x1F150 + i);

// ── Regional indicator (flag letters style) ───────────────────────────────────
const regionalMap = {};
for (let i = 0; i < 26; i++) {
  regionalMap[UPPERCASE[i]] = String.fromCodePoint(0x1F1E6 + i);
  regionalMap[LOWERCASE[i]] = String.fromCodePoint(0x1F1E6 + i);
}

// ── Small Caps map ────────────────────────────────────────────────────────────
const smallCapsChars = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ';
const smallCapsMap = {};
for (let i = 0; i < 26; i++) {
  smallCapsMap[UPPERCASE[i]] = smallCapsChars[i];
  smallCapsMap[LOWERCASE[i]] = smallCapsChars[i];
}

// ── Upside-down map ───────────────────────────────────────────────────────────
const upsideDownSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const upsideDownTarget = 'ɐqɔpǝɟƃɥᴉɾʞʅɯuodbɹsʇnʌʍxʎzɐqɔpǝɟƃɥᴉɾʞʅɯuodbɹsʇnʌʍxʎz0ƖᄅƐㄣϛ9ㄥ86';
const upsideDownMap = {};
for (let i = 0; i < upsideDownSource.length; i++) upsideDownMap[upsideDownSource[i]] = upsideDownTarget[i];

function upsideDown(text) {
  return [...text].map(c => upsideDownMap[c] ?? c).reverse().join('');
}

// ── Superscript map ───────────────────────────────────────────────────────────
const superscriptMap = {
  a:'ᵃ',b:'ᵇ',c:'ᶜ',d:'ᵈ',e:'ᵉ',f:'ᶠ',g:'ᵍ',h:'ʰ',i:'ⁱ',j:'ʲ',k:'ᵏ',l:'ˡ',m:'ᵐ',
  n:'ⁿ',o:'ᵒ',p:'ᵖ',r:'ʳ',s:'ˢ',t:'ᵗ',u:'ᵘ',v:'ᵛ',w:'ʷ',x:'ˣ',y:'ʸ',z:'ᶻ',
  A:'ᴬ',B:'ᴮ',C:'ᶜ',D:'ᴰ',E:'ᴱ',F:'ᶠ',G:'ᴳ',H:'ᴴ',I:'ᴵ',J:'ᴶ',K:'ᴷ',L:'ᴸ',M:'ᴹ',
  N:'ᴺ',O:'ᴼ',P:'ᴾ',R:'ᴿ',T:'ᵀ',U:'ᵁ',V:'ⱽ',W:'ᵂ',
  '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
};

// ── Subscript map ─────────────────────────────────────────────────────────────
const subscriptMap = {
  a:'ₐ',e:'ₑ',h:'ₕ',i:'ᵢ',j:'ⱼ',k:'ₖ',l:'ₗ',m:'ₘ',n:'ₙ',o:'ₒ',p:'ₚ',r:'ᵣ',
  s:'ₛ',t:'ₜ',u:'ᵤ',v:'ᵥ',x:'ₓ',
  '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉',
};

// ── Morse / braille-style decorators ─────────────────────────────────────────
function addStars(text) { return `★彡 ${text} 彡★`; }
function addHearts(text) { return `♡ ${text} ♡`; }
function addWaves(text) { return `〜 ${text} 〜`; }
function addArrows(text) { return `➤ ${text} ➤`; }
function addDots(text) { return `· ${text} ·`; }
function addFlowers(text) { return `✿ ${text} ✿`; }
function addLightning(text) { return `⚡ ${text} ⚡`; }
function addDiamond(text) { return `◆ ${text} ◆`; }
function addMoon(text) { return `☾ ${text} ☽`; }
function addSunrise(text) { return `☀ ${text} ☀`; }

// ══════════════════════════════════════════════════════════════════
//  FONT STYLES REGISTRY
//  Each entry: { name, category, convert: fn(text) => string }
// ══════════════════════════════════════════════════════════════════
const fontStyles = [
  // ── SERIF ────────────────────────────────────────────────────────
  { name:'Bold Serif', cat:'serif',      convert: t => applyMap(t, charMap(0x1D400,0x1D41A,0x1D7CE)) },
  { name:'Italic Serif', cat:'serif',    convert: t => applyMap(t, charMap(0x1D434,0x1D44E,undefined)) },
  { name:'Bold Italic Serif', cat:'serif', convert: t => applyMap(t, charMap(0x1D468,0x1D482,undefined)) },
  { name:'Script / Cursive', cat:'serif', convert: t => applyMap(t, charMap(0x1D49C,0x1D4B6,undefined)) },
  { name:'Bold Script', cat:'serif',     convert: t => applyMap(t, charMap(0x1D4D0,0x1D4EA,undefined)) },
  { name:'Fraktur', cat:'gothic',        convert: t => applyMap(t, charMap(0x1D504,0x1D51E,undefined)) },
  { name:'Bold Fraktur', cat:'gothic',   convert: t => applyMap(t, charMap(0x1D56C,0x1D586,undefined)) },
  { name:'Double Struck', cat:'gothic',  convert: t => applyMap(t, charMap(0x1D538,0x1D552,0x1D7D8)) },

  // ── SANS ─────────────────────────────────────────────────────────
  { name:'Sans-Serif', cat:'serif',      convert: t => applyMap(t, charMap(0x1D5A0,0x1D5BA,0x1D7E2)) },
  { name:'Bold Sans', cat:'serif',       convert: t => applyMap(t, charMap(0x1D5D4,0x1D5EE,0x1D7EC)) },
  { name:'Italic Sans', cat:'serif',     convert: t => applyMap(t, charMap(0x1D608,0x1D622,undefined)) },
  { name:'Bold Italic Sans', cat:'serif',convert: t => applyMap(t, charMap(0x1D63C,0x1D656,undefined)) },
  { name:'Monospace', cat:'serif',       convert: t => applyMap(t, charMap(0x1D670,0x1D68A,0x1D7F6)) },

  // ── BUBBLES & SQUARES ────────────────────────────────────────────
  { name:'Circled', cat:'bubbles',       convert: t => applyMap(t, circledMap) },
  { name:'Negative Circled', cat:'bubbles', convert: t => applyMap(t, negCircledMap) },
  { name:'Fullwidth', cat:'decorative',  convert: t => applyMap(t, fullwidthMap) },
  { name:'Small Caps', cat:'decorative', convert: t => applyMap(t, smallCapsMap) },
  { name:'Superscript', cat:'decorative',convert: t => [...t].map(c=>superscriptMap[c]??c).join('') },
  { name:'Subscript', cat:'decorative',  convert: t => [...t].map(c=>subscriptMap[c]??c).join('') },
  { name:'Upside Down', cat:'decorative',convert: upsideDown },

  // ── COMBINING / STRIKETHROUGH ─────────────────────────────────────
  { name:'Strikethrough', cat:'strike',  convert: t => combineChars(t, '\u0336') },
  { name:'Double Strikethrough', cat:'strike', convert: t => combineChars(t, '\u0335') },
  { name:'Underline', cat:'strike',      convert: t => combineChars(t, '\u0332') },
  { name:'Double Underline', cat:'strike', convert: t => combineChars(t, '\u0333') },
  { name:'Overline', cat:'strike',       convert: t => combineChars(t, '\u0305') },
  { name:'Wavy Underline', cat:'strike', convert: t => combineChars(t, '\u0330') },
  { name:'Slash Through', cat:'strike',  convert: t => combineChars(t, '\u0338') },
  { name:'Dot Above', cat:'decorative',  convert: t => combineChars(t, '\u0307') },
  { name:'Tilde Above', cat:'decorative',convert: t => combineChars(t, '\u0303') },
  { name:'Ring Above', cat:'decorative', convert: t => combineChars(t, '\u030A') },
  { name:'Diaeresis', cat:'decorative',  convert: t => combineChars(t, '\u0308') },
  { name:'Underline Dots', cat:'strike', convert: t => combineChars(t, '\u0323') },

  // ── DECORATIVE FRAMES ─────────────────────────────────────────────
  { name:'⭐ Star Frame', cat:'decorative', convert: t => addStars(t) },
  { name:'♡ Heart Frame', cat:'decorative', convert: t => addHearts(t) },
  { name:'〜 Wave Frame', cat:'decorative', convert: t => addWaves(t) },
  { name:'➤ Arrow Frame', cat:'decorative', convert: t => addArrows(t) },
  { name:'· Dot Frame', cat:'decorative', convert: t => addDots(t) },
  { name:'✿ Flower Frame', cat:'decorative', convert: t => addFlowers(t) },
  { name:'⚡ Lightning Frame', cat:'decorative', convert: t => addLightning(t) },
  { name:'◆ Diamond Frame', cat:'decorative', convert: t => addDiamond(t) },
  { name:'☾ Moon Frame', cat:'decorative', convert: t => addMoon(t) },
  { name:'☀ Sun Frame', cat:'decorative', convert: t => addSunrise(t) },
];

// ── Add more combined styles (bold serif + decorators) ──────────────────────
const boldMap  = charMap(0x1D400,0x1D41A,0x1D7CE);
const italMap  = charMap(0x1D434,0x1D44E,undefined);
const scriptMap= charMap(0x1D49C,0x1D4B6,undefined);
const bscriptM = charMap(0x1D4D0,0x1D4EA,undefined);
const frakMap  = charMap(0x1D504,0x1D51E,undefined);
const bfrakMap = charMap(0x1D56C,0x1D586,undefined);
const dsMap    = charMap(0x1D538,0x1D552,0x1D7D8);
const sansMap  = charMap(0x1D5A0,0x1D5BA,0x1D7E2);
const bsansMap = charMap(0x1D5D4,0x1D5EE,0x1D7EC);
const monoMap  = charMap(0x1D670,0x1D68A,0x1D7F6);

const extraStyles = [
  { name:'Bold ★ Star Wrap', cat:'decorative', convert: t => addStars(applyMap(t, boldMap)) },
  { name:'Script ♡ Heart', cat:'serif',   convert: t => addHearts(applyMap(t, scriptMap)) },
  { name:'Fraktur ⚡ Lightning', cat:'gothic', convert: t => addLightning(applyMap(t, frakMap)) },
  { name:'Double Struck ◆', cat:'gothic', convert: t => addDiamond(applyMap(t, dsMap)) },
  { name:'Italic + Strikethrough', cat:'strike', convert: t => combineChars(applyMap(t, italMap),'\u0336') },
  { name:'Bold + Underline', cat:'strike', convert: t => combineChars(applyMap(t, boldMap),'\u0332') },
  { name:'Bold Script ★', cat:'serif',    convert: t => addStars(applyMap(t, bscriptM)) },
  { name:'Monospace ◆', cat:'serif',      convert: t => addDiamond(applyMap(t, monoMap)) },
  { name:'Fullwidth ⭐', cat:'decorative', convert: t => addStars(applyMap(t, fullwidthMap)) },
  { name:'Small Caps ☾', cat:'decorative', convert: t => addMoon(applyMap(t, smallCapsMap)) },
  { name:'Bold Fraktur ☀', cat:'gothic',  convert: t => addSunrise(applyMap(t, bfrakMap)) },
  { name:'Sans + Tilde', cat:'decorative', convert: t => combineChars(applyMap(t, sansMap),'\u0303') },
  { name:'Bold Sans + Dots', cat:'decorative', convert: t => combineChars(applyMap(t, bsansMap),'\u0307') },
  { name:'Script + Overline', cat:'serif', convert: t => combineChars(applyMap(t, scriptMap),'\u0305') },
  { name:'Upside Down ✿', cat:'decorative', convert: t => addFlowers(upsideDown(t)) },
  { name:'Subscript + Underline', cat:'strike', convert: t => combineChars([...t].map(c=>subscriptMap[c]??c).join(''),'\u0332') },
  { name:'Circled ★', cat:'bubbles',      convert: t => addStars(applyMap(t, circledMap)) },
  { name:'Neg. Circled ♡', cat:'bubbles', convert: t => addHearts(applyMap(t, negCircledMap)) },
  { name:'Bold Italic + Overline', cat:'serif', convert: t => combineChars(applyMap(t, charMap(0x1D468,0x1D482)),'\u0305') },
  { name:'Italic + Wavy', cat:'strike',   convert: t => combineChars(applyMap(t, italMap),'\u0330') },
  { name:'Double-Struck Strikethrough', cat:'strike', convert: t => combineChars(applyMap(t, dsMap),'\u0336') },
  { name:'Fraktur + Diaeresis', cat:'gothic', convert: t => combineChars(applyMap(t, frakMap),'\u0308') },
  { name:'Fullwidth + Strikethrough', cat:'strike', convert: t => combineChars(applyMap(t, fullwidthMap),'\u0336') },
  { name:'Bold Script ♡ + Underline', cat:'serif', convert: t => combineChars(addHearts(applyMap(t, bscriptM)),'\u0332') },
  { name:'Superscript + Dots', cat:'decorative', convert: t => combineChars([...t].map(c=>superscriptMap[c]??c).join(''),'\u0307') },
  { name:'Arrow Wrap + Bold', cat:'decorative', convert: t => addArrows(applyMap(t, boldMap)) },
  { name:'Wave + Script', cat:'decorative', convert: t => addWaves(applyMap(t, scriptMap)) },
  { name:'Bold Fraktur + Strikethrough', cat:'gothic', convert: t => combineChars(applyMap(t, bfrakMap),'\u0336') },
  { name:'Sans Italic ➤', cat:'serif',    convert: t => addArrows(applyMap(t, charMap(0x1D608,0x1D622))) },
  { name:'Monospace + Tilde', cat:'serif', convert: t => combineChars(applyMap(t, monoMap),'\u0303') },
  { name:'Small Caps + Star', cat:'decorative', convert: t => addStars(applyMap(t, smallCapsMap)) },
  { name:'Dot Above + Bold', cat:'decorative', convert: t => combineChars(applyMap(t, boldMap),'\u0307') },
  { name:'Ring Above + Script', cat:'decorative', convert: t => combineChars(applyMap(t, scriptMap),'\u030A') },
  { name:'Upside Down + Overline', cat:'decorative', convert: t => combineChars(upsideDown(t),'\u0305') },
  { name:'Circled + Dot', cat:'bubbles',  convert: t => combineChars(applyMap(t, circledMap),'\u0307') },
  { name:'Fullwidth Wave', cat:'decorative', convert: t => addWaves(applyMap(t, fullwidthMap)) },
  { name:'Italic + Ring', cat:'serif',    convert: t => combineChars(applyMap(t, italMap),'\u030A') },
  { name:'Bold + Slash', cat:'strike',    convert: t => combineChars(applyMap(t, boldMap),'\u0338') },
  { name:'Fraktur Wave Wrap', cat:'gothic', convert: t => addWaves(applyMap(t, frakMap)) },
  { name:'Moon + Script', cat:'decorative', convert: t => addMoon(applyMap(t, scriptMap)) },
  { name:'Bold Italic + Strikethrough', cat:'strike', convert: t => combineChars(applyMap(t, charMap(0x1D468,0x1D482)),'\u0336') },
  { name:'Subscript Script', cat:'decorative', convert: t => [...applyMap(t, scriptMap)].map(c=>subscriptMap[c]??c).join('') },
  { name:'Diamond + Bold', cat:'decorative', convert: t => addDiamond(applyMap(t, boldMap)) },
  { name:'Sans Bold + Wavy', cat:'serif', convert: t => combineChars(applyMap(t, bsansMap),'\u0330') },
  { name:'Monospace ♡ Heart', cat:'serif', convert: t => addHearts(applyMap(t, monoMap)) },
  { name:'Double Struck + Ring', cat:'gothic', convert: t => combineChars(applyMap(t, dsMap),'\u030A') },
  { name:'Neg. Circled Star', cat:'bubbles', convert: t => addStars(applyMap(t, negCircledMap)) },
  { name:'Flower + Italic', cat:'decorative', convert: t => addFlowers(applyMap(t, italMap)) },
  { name:'Lightning + Fraktur', cat:'gothic', convert: t => addLightning(applyMap(t, frakMap)) },
  { name:'Bold + Double Underline', cat:'strike', convert: t => combineChars(applyMap(t, boldMap),'\u0333') },
  { name:'Script + Slash', cat:'serif',   convert: t => combineChars(applyMap(t, scriptMap),'\u0338') },
  { name:'Sun + Double Struck', cat:'gothic', convert: t => addSunrise(applyMap(t, dsMap)) },
];

const allStyles = [...fontStyles, ...extraStyles];

// ══════════════════════════════════════════════════════════════════
//  UI FUNCTIONS
// ══════════════════════════════════════════════════════════════════

let lastText = '';
let activeCategory = 'all';

function updateCharCount() {
  const input = document.getElementById('inputText');
  document.getElementById('charCount').textContent = input.value.length;
}

function generateFonts() {
  const text = document.getElementById('inputText').value.trim();
  if (!text) {
    showToast('Please type some text first!');
    return;
  }
  lastText = text;
  renderFonts(text, activeCategory);
}

function filterCategory() {
  activeCategory = document.getElementById('categoryFilter').value;
  if (lastText) renderFonts(lastText, activeCategory);
}

function renderFonts(text, category) {
  const grid = document.getElementById('outputGrid');
  const filtered = category === 'all' ? allStyles : allStyles.filter(s => s.cat === category);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:#606080;text-align:center;padding:40px;grid-column:1/-1">No styles in this category. Try "All Styles".</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach((style, idx) => {
    let converted;
    try { converted = style.convert(text); }
    catch(e) { converted = text; }

    const card = document.createElement('div');
    card.className = 'font-result';
    card.setAttribute('data-idx', idx);
    card.innerHTML = `
      <span class="font-result-label">${escapeHtml(style.name)}</span>
      <span class="font-result-text" id="result-${idx}">${escapeHtml(converted)}</span>
      <div class="font-result-actions">
        <button class="btn-copy" onclick="copyFont(${idx})" aria-label="Copy ${escapeAttr(style.name)}">Copy</button>
      </div>`;
    fragment.appendChild(card);
  });

  grid.innerHTML = '';
  grid.appendChild(fragment);
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function escapeAttr(str) {
  return str.replace(/'/g,'&#39;').replace(/"/g,'&quot;');
}

function copyFont(idx) {
  // Read the rendered text straight from the DOM (avoids inline-arg escaping bugs)
  const el = document.getElementById(`result-${idx}`);
  if (!el) return;
  const decoded = el.textContent;

  navigator.clipboard.writeText(decoded).then(() => {
    showToast('✓ Copied to clipboard!');
    const btn = document.querySelector(`[data-idx="${idx}"] .btn-copy`);
    if (btn) {
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1800);
    }
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = decoded;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('✓ Copied!');
  });
}

function clearAll() {
  document.getElementById('inputText').value = '';
  document.getElementById('charCount').textContent = '0';
  lastText = '';
  document.getElementById('outputGrid').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">✦</div>
      <p class="empty-title">Your fancy fonts will appear here</p>
      <p class="empty-hint">Type text above and click <strong>Generate Fonts</strong></p>
    </div>`;
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function toggleNav() {
  document.querySelector('.nav-links').classList.toggle('open');
}

// ── Auto-generate on Enter key in textarea ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('inputText');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateFonts();
      }
    });
  }

  // Close mobile nav on link click
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.querySelector('.nav-links').classList.remove('open');
    });
  });
});

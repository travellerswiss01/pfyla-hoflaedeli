const form = document.querySelector('#suche');
const input = form.querySelector('input');
const panel = document.querySelector('#treffer');
const groups = [...document.querySelectorAll('.cards details')].map(el => ({
  label: el.dataset.productLabel || el.querySelector('summary span').textContent, el, terms: (el.dataset.productLabel || '') + ' ' + el.textContent
}));
const season = document.querySelector('.season');
const products = [];
function add(label, target, aliases) {
  const el = typeof target === 'number' ? groups[target].el : document.querySelector(target);
  if (el) products.push({label, el, terms: label + ' ' + aliases});
}
// Card titles also serve as the dialect labels in the suggestions and menus.
add(groups[0].label, 0, 'Alpchääs Alpchäs Alpkäse Käse Chäs Chääs Muotitaler Muotathaler Alpkäse Muotathaler Alpkaese');
add(groups[1].label, 1, 'Mutschli Raclette Raclettekäse Käse Chääs Chäs');
add(groups[2].label, 2, 'Geisschääs Geisschäs Geisskäse Ziegenkäse Geissenmilch Ziegenmilch Käse Chäs Chääs');
add(groups[3].label, 3, 'Alpchääsärii Chääsärii Sännärii Alpkäserei Käserei Tröligen Alp Joghurt Butter Ankä Anke Anken');
add('Wänn isch offä?', '#besuch', 'offä off offen offe geöffnet Öffnungszeiten Öffnigsziitä Öffnigsziite Selbstbedienung Selbstbedienig sälber Bedienig Jahr');
add('Wääg is Lädeli', '#karte', 'Route Anfahrt Aafahrt Adresse Standort Weg Ried Muotathal Muotital Muätital Kapellmatt');
add('Kontakt', '#kontakt .hofkontakt', 'Telefon Telefonnummer E-Mail Email Mail Marianne Oskar Pfyl');
add('Hoflädeli', '#sortiment', 'Hofladen Lädeli Sortiment Angebot Agebot');
function normalize(value) {
  return value.toLocaleLowerCase('de').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function findProducts(query) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return words.length ? products.filter(item => {
    const terms = normalize(item.terms).split(' ');
    return words.every(word => terms.some(term => term.startsWith(word)));
  }) : [];
}
let highlight;
input.placeholder = 'Was suächsch?';
function show() {
  const term = input.value.trim().toLocaleLowerCase('de');
  const hits = term ? findProducts(term) : products.filter(item => groups.slice(0, 3).some(group => group.el === item.el) || item.el.id === 'besuch');
  panel.replaceChildren();
  for (const hit of hits) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = hit.label;
    button.onclick = () => {
      panel.hidden = true;
      input.value = '';
      if (hit.el.tagName === 'DETAILS') hit.el.open = true;
      const target = hit.el.querySelector('summary') || hit.el;
      if (target === hit.el) target.tabIndex = -1;
      target.focus({preventScroll:true});
      const row = target.querySelector('span') || target;
      row.scrollIntoView({block:'center', behavior:'instant'});
      highlight?.cancel();
      const normal = getComputedStyle(row);
      const marked = {backgroundColor:'#f4b32e', color:'#281904', boxShadow:'inset 0 0 0 3px #956000'};
      highlight = row.animate([marked, {...marked, offset:0.72},
        {backgroundColor:normal.backgroundColor, color:normal.color, boxShadow:normal.boxShadow}], {
        duration:2400, easing:motion.matches ? 'steps(1, end)' : 'linear'
      });
    };
    panel.append(button);
  }
  if (!hits.length) {
    const message = document.createElement('p');
    message.textContent = 'Nüüd gfundä?';
    const phone = document.querySelector('#kontakt .hofkontakt a[href^="tel:"]');
    panel.append(message, phone.cloneNode(true));
  }
  panel.hidden = false;
}
input.addEventListener('input',show);
input.addEventListener('focus',show);
input.addEventListener('click',show);
input.addEventListener('search',show);
form.onsubmit = event => {
  event.preventDefault();
  if (!input.value.trim()) {
    panel.textContent = 'Was suächsch? Zum Biispiil Alpchääs oder Raclette.';
    panel.hidden = false;
    input.focus();
    return;
  }
  show();
  panel.querySelector('button')?.click();
};
form.onkeydown = event => {if(event.key==='Escape'){panel.hidden=true;input.focus()}};
document.addEventListener('focusin',event=>{if(!form.contains(event.target))panel.hidden=true});
document.addEventListener('click',event=>{if(!form.contains(event.target))panel.hidden=true});
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const nav = document.querySelector('#start nav');
const menus = [];
function closeMenus() {
  for (const {trigger,panel} of menus) {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded','false');
  }
}
function setup(trigger,panel) {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-dropdown';
  trigger.before(wrapper);
  wrapper.append(trigger,panel);
  trigger.setAttribute('aria-controls', panel.id);
  trigger.setAttribute('aria-expanded','false');
  panel.classList.add('hof-menu');
  panel.hidden = true;
  menus.push({trigger,panel});
  trigger.onclick = event => {
    event.preventDefault();
    const opening = panel.hidden;
    closeMenus();
    if (!opening) return;
    panel.style.left = '0px';
    panel.hidden = false;
    const rightOverflow = panel.getBoundingClientRect().right - document.documentElement.clientWidth + 8;
    if (rightOverflow > 0) panel.style.left = -rightOverflow + 'px';
    trigger.setAttribute('aria-expanded','true');
  };
}
function createPanel(hash) {
  const trigger = nav.querySelector('a[href="#'+hash+'"]');
  const panel = document.createElement('div');
  panel.id = 'menue-'+hash;
  setup(trigger,panel);
  return panel;
}
function offer(panel,label,target) {
  const link = document.createElement('a');
  link.textContent = label;
  link.href = '#'+target.id;
  link.onclick = () => {
    if (target.matches('details')) target.open = true;
    target.tabIndex = -1;
    target.focus();
    closeMenus();
  };
  panel.append(link);
}
const assortment = document.querySelector('#angebot-liste');
setup(document.querySelector('#angebot-toggle'),assortment);
for (const [i,group] of groups.entries()) {
  group.el.id ||= 'angebot-'+i;
  offer(assortment, group.label, group.el);
}
const heading = document.createElement('strong');
heading.textContent = season.querySelector('h3').textContent;
assortment.append(heading);
const seasonal = createPanel('saison');
for (const [i,item] of [...season.querySelectorAll('li')].entries()) {
  item.id ||= 'saisonprodukt-'+i;
  for (const panel of [seasonal,assortment]) offer(panel,item.textContent.trim(),item);
}
const hours = createPanel('besuch');
for (const row of document.querySelectorAll('.aushang p')) hours.append(row.cloneNode(true));
const contact = createPanel('kontakt');
contact.append(document.querySelector('.hofkontakt').cloneNode(true));
document.addEventListener('click',event => {
  if (!menus.some(({trigger,panel})=>trigger.contains(event.target)||panel.contains(event.target))) closeMenus();
});
document.addEventListener('keydown',event => {
  const open = menus.find(({panel})=>!panel.hidden);
  if (open && event.key==='Escape') {closeMenus();open.trigger.focus()}
});
window.addEventListener('resize',closeMenus);


const newsLink = nav.querySelector('a[href="#hof"]');
function markNewsSection() {
  if (location.hash === '#hof') newsLink.setAttribute('aria-current','location');
  else newsLink.removeAttribute('aria-current');
}
markNewsSection();
window.addEventListener('hashchange', markNewsSection);

const menuSign = document.getElementById('menue-schild');
menuSign.hidden = false;
function collapseNavigation() {
  menuSign.setAttribute('aria-expanded', 'false');
  closeMenus();
}
menuSign.addEventListener('click', () => {
  if (menuSign.getAttribute('aria-expanded') === 'true') collapseNavigation();
  else menuSign.setAttribute('aria-expanded', 'true');
});
nav.addEventListener('click', event => {
  if (event.target.closest('a[href^="#"]:not([aria-expanded])')) collapseNavigation();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuSign.getAttribute('aria-expanded') === 'true') {
    collapseNavigation();
    menuSign.focus();
  }
});
matchMedia('(max-width:780px)').addEventListener('change', collapseNavigation);

// Client-side directory filtering. All agencies are already in the HTML; this only shows/hides and reorders them.
// Filter state lives in the URL fragment (e.g. /directory/#industry=healthcare&q=ust&sort=za) so no crawlable
// combination pages are created.

export function initDirectory() {
  const form = document.getElementById('dir-filters') as HTMLFormElement | null;
  const list = document.getElementById('dir-list');
  if (!form || !list) return;

  const q = document.getElementById('q') as HTMLInputElement;
  const ind = document.getElementById('ind') as HTMLSelectElement;
  const sort = document.getElementById('sort') as HTMLSelectElement;
  const count = document.getElementById('count')!;
  const empty = document.getElementById('empty')!;
  const items = Array.from(list.querySelectorAll<HTMLLIElement>('.dir-item'));
  const total = items.length;

  form.hidden = false;

  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    q.value = p.get('q') ?? '';
    const i = p.get('industry') ?? '';
    ind.value = Array.from(ind.options).some((o) => o.value === i) ? i : '';
    sort.value = p.get('sort') === 'za' ? 'za' : 'az';
  }

  function writeHash() {
    const p = new URLSearchParams();
    if (ind.value) p.set('industry', ind.value);
    if (q.value.trim()) p.set('q', q.value.trim());
    if (sort.value === 'za') p.set('sort', 'za');
    const h = p.toString();
    history.replaceState(null, '', h ? `#${h}` : location.pathname + location.search);
  }

  function apply() {
    const term = q.value.trim().toLowerCase();
    const industry = ind.value;
    let shown = 0;
    const sorted = [...items].sort((a, b) => {
      const c = (a.dataset.name ?? '').localeCompare(b.dataset.name ?? '', 'en');
      return sort.value === 'za' ? -c : c;
    });
    for (const el of sorted) {
      const matchQ = !term || (el.dataset.search ?? '').includes(term);
      const matchI = !industry || (el.dataset.industries ?? '').split(' ').includes(industry);
      el.hidden = !(matchQ && matchI);
      if (!el.hidden) shown++;
      list!.appendChild(el);
    }
    const label = industry ? ` in ${ind.options[ind.selectedIndex].text}` : '';
    count.textContent = shown === total && !term && !industry ? `${total} agencies` : `${shown} of ${total} agencies${label}`;
    empty.hidden = shown !== 0;
  }

  function clear() {
    q.value = '';
    ind.value = '';
    sort.value = 'az';
    writeHash();
    apply();
    q.focus();
  }

  readHash();
  apply();
  q.addEventListener('input', () => { writeHash(); apply(); });
  ind.addEventListener('change', () => { writeHash(); apply(); });
  sort.addEventListener('change', () => { writeHash(); apply(); });
  document.getElementById('clear')?.addEventListener('click', clear);
  document.getElementById('clear2')?.addEventListener('click', clear);
  window.addEventListener('hashchange', () => { readHash(); apply(); });
}

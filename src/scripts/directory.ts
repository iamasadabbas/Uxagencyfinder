// Client-side directory filtering. All agencies are already in the HTML; this only shows/hides and reorders them.
// Filter state lives in the URL fragment (e.g. /directory/#industry=healthcare&q=ust&sort=za), so no crawlable
// combination pages are created.

export function initDirectory() {
  const form = document.getElementById('dir-filters') as HTMLFormElement | null;
  const list = document.getElementById('dir-list');
  if (!form || !list) return;

  const q = document.getElementById('q') as HTMLInputElement;
  const sort = document.getElementById('sort') as HTMLSelectElement;
  const chips = Array.from(form.querySelectorAll<HTMLButtonElement>('.chip'));
  const count = document.getElementById('count')!;
  const empty = document.getElementById('empty')!;
  const clearBtn = document.getElementById('clear')!;
  const items = Array.from(list.querySelectorAll<HTMLLIElement>('.dir-item'));
  const total = items.length;
  let industry = '';

  form.hidden = false;

  const setIndustry = (id: string) => {
    industry = chips.some((c) => c.dataset.industry === id) ? id : '';
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.industry === industry)));
  };

  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    q.value = p.get('q') ?? '';
    setIndustry(p.get('industry') ?? '');
    sort.value = p.get('sort') === 'za' ? 'za' : 'az';
  }

  function writeHash() {
    const p = new URLSearchParams();
    if (industry) p.set('industry', industry);
    if (q.value.trim()) p.set('q', q.value.trim());
    if (sort.value === 'za') p.set('sort', 'za');
    const h = p.toString();
    history.replaceState(null, '', h ? `#${h}` : location.pathname + location.search);
  }

  function apply() {
    const term = q.value.trim().toLowerCase();
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
    const active = !!term || !!industry || sort.value === 'za';
    const chip = chips.find((c) => c.dataset.industry === industry);
    const label = industry && chip ? ` in ${chip.textContent?.trim()}` : '';
    count.textContent = !term && !industry ? `${total} agencies` : `${shown} of ${total} agencies${label}`;
    empty.hidden = shown !== 0;
    clearBtn.hidden = !active;
  }

  function clear() {
    q.value = '';
    setIndustry('');
    sort.value = 'az';
    writeHash();
    apply();
    q.focus();
  }

  readHash();
  apply();
  q.addEventListener('input', () => { writeHash(); apply(); });
  sort.addEventListener('change', () => { writeHash(); apply(); });
  chips.forEach((c) => c.addEventListener('click', () => {
    setIndustry(c.dataset.industry ?? '');
    writeHash();
    apply();
    if (industry) (window as any).uafTrack?.('directory_filter', { industry });
  }));
  clearBtn.addEventListener('click', clear);
  document.getElementById('clear2')?.addEventListener('click', clear);
  window.addEventListener('hashchange', () => { readHash(); apply(); });
}

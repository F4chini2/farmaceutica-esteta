// << ADICIONE ESTA LINHA

export function Pagination({ page, total, onPage, window = 2, showAlways = false }) {
  if (!total || total <= 1) {
    if (!showAlways) return null;
  }

  const go = (p) => {
    if (p < 1 || p > total || p === page) return;
    onPage(p);
  };

  // itens com reticências
  const getItems = (current, totalPages, radius) => {
    const items = [];
    const left = Math.max(2, current - radius);
    const right = Math.min(totalPages - 1, current + radius);

    items.push(1);
    if (left > 2) items.push('...');
    for (let p = left; p <= right; p++) items.push(p);
    if (right < totalPages - 1) items.push('...');
    if (totalPages > 1) items.push(totalPages);
    return items.filter((v, i, a) => i === 0 || v !== a[i - 1]); // de-dupe
  };

  const items = getItems(page, total, window);

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => go(1)} disabled={page === 1}>{'«'}</button>
      <button className="page-btn" onClick={() => go(page - 1)} disabled={page === 1}>{'‹'}</button>

      {items.map((it, idx) =>
        it === '...' ? (
          <span key={'e' + idx} className="page-ellipsis">…</span>
        ) : (
          <button
            key={it}
            className={`page-btn ${it === page ? 'active' : ''}`}
            onClick={() => go(it)}
          >
            {it}
          </button>
        )
      )}

      <button className="page-btn" onClick={() => go(page + 1)} disabled={page === total}>{'›'}</button>
      <button className="page-btn" onClick={() => go(total)} disabled={page === total}>{'»'}</button>
    </div>
  );
}

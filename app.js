(() => {
  const $ = id => document.getElementById(id);
  const form = $('form'), input = $('url'), submit = $('submit'), status = $('status'), result = $('result');
  let finalDestination = '';

  function setStatus(message, kind='') {
    status.textContent = message;
    status.className = 'status ' + kind;
    status.hidden = !message;
  }
  function validUrl(value) {
    try {
      const u = new URL(value.trim());
      return ['http:', 'https:'].includes(u.protocol) && u.hostname.includes('.') ? u : null;
    } catch { return null; }
  }
  function render(data) {
    finalDestination = data.finalUrl;
    const a = $('final-url'); a.textContent = data.finalUrl; a.href = data.finalUrl;
    $('open').href = data.finalUrl;
    $('meta').textContent = `${data.hops} pengalihan • ${(data.durationMs / 1000).toFixed(2)} detik`;
    $('chain').replaceChildren(...data.chain.map(url => {
      const li = document.createElement('li'); li.textContent = url; return li;
    }));
    $('note').textContent = data.note || '';
    $('note').hidden = !data.note;
    result.hidden = false;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    result.hidden = true;
    const url = validUrl(input.value);
    if (!url) { setStatus('Masukkan URL http:// atau https:// yang valid.', 'error'); return; }
    const api = (window.LINKSCOPE_API || '').replace(/\/$/, '');
    if (!api || api.includes('GANTI-DENGAN')) {
      setStatus('Backend belum dipasang. Ikuti petunjuk di README untuk menerbitkan Cloudflare Worker.', 'error'); return;
    }
    submit.disabled = true; submit.querySelector('span').textContent = 'Memeriksa…';
    setStatus('Sedang memeriksa pengalihan tautan. Mohon tunggu…');
    try {
      const response = await fetch(api + '/api/bypass', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({url: url.href})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || `Server merespons dengan status ${response.status}.`);
      render(data); setStatus('Pemeriksaan selesai.', 'ok');
    } catch (error) {
      setStatus(error.message || 'Tidak dapat menghubungi backend. Periksa URL Worker dan koneksi.', 'error');
    } finally {
      submit.disabled = false; submit.querySelector('span').textContent = 'Periksa link';
    }
  });
  $('copy').addEventListener('click', async () => {
    if (!finalDestination) return;
    try { await navigator.clipboard.writeText(finalDestination); setStatus('URL tujuan berhasil disalin.', 'ok'); }
    catch { setStatus('Tidak dapat menyalin otomatis. Tekan lama URL tujuan untuk menyalinnya.', 'error'); }
  });
})();

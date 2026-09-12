/* ===== EV ORGANIZATOR: 3D RENK ONIZLEME (site temasi icinde) =====
   Veri: window.EV_URUN (urun), window.EV_RENKLER (kartela), window.EV_ORTAM (hdr/exposure/kok)
   - Galeri karesi: kucuk resim rayina "3D" karesi; tiklaninca fotograf yigini yerine <model-viewer>.
   - Secenekler kutusu: parca sekmeleri (cok parcali urunde) + 20 renk cipi (Standart / Katalog).
   - Renk cipine tiklaninca secili parca boyanir; 3D kapaliysa otomatik acilir.
   Ayarlar urun.html (calisma sayfasi) ile aynidir: studyo.hdr, tone-mapping neutral, AO+doku GLB. */
(function () {
  if (window.__ev3d) return; window.__ev3d = true;
  var u = window.EV_URUN, R = window.EV_RENKLER, O = window.EV_ORTAM || {};
  if (!u || !R) return;
  var KOK = O.kok || '/__local/organizer/';
  var V = Array.isArray(u.varyantlar) && u.varyantlar.length ? u.varyantlar : null, vi = 0;   /* varyantli urun (Orbe: Duz / Yivli) */
  function cur() { return V ? V[vi] : u; }
  var renkSecildi = false, modSecSonra = false;
  var glb = KOK + cur().glb;
  var IKON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>';
  var HEX = {}; (R.standart || []).concat(R.katalog || []).forEach(function (r) { HEX[r[0]] = r[1]; });
  var secim = cur().parcalar.map(function (p) { return p.renk; });   /* parca basina secili renk adi */
  var aktif = 0;                                                  /* aktif parca */
  var col, car, kap, mv = null, acik = false, sonYuk = 0;

  function s2l(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function hex2lin(h) { var n = parseInt(h.slice(1), 16); return [s2l((n >> 16) & 255), s2l((n >> 8) & 255), s2l(n & 255), 1]; }
  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

  function stil() {
    if (document.getElementById('ev3d-stil')) return;
    var st = document.createElement('style'); st.id = 'ev3d-stil';
    st.textContent =
      '.ev-fiyat-yok{font-size:15px !important;font-weight:400 !important;color:#8d857c !important}' +
      '#nz-summary{display:none !important}' +   /* tema ozet kutusu (Urun/Taksit/Ara Toplam): fiyat yokken anlamsiz */
      /* secenekler */
      '#ev-secenekler{font-size:13px;color:#333}' +
      '.ev-etiket{display:block;margin:0 0 8px;font-size:13px}.ev-etiket strong{font-weight:600;color:#111}' +
      '.ev-parcalar{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}' +
      '.ev-parca{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;border:1px solid #e3ded7;background:#fff;font-size:12px;color:#333;cursor:pointer;line-height:1;transition:border-color .15s,background .15s}' +
      '.ev-parca .ev-nokta{width:12px;height:12px;border-radius:50%;border:1px solid rgba(0,0,0,.12);flex:0 0 auto}' +
      '.ev-parca.active{border-color:#290b13;background:#fbf7f2}' +
      '.ev-grup{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#8d857c;margin:10px 0 6px}' +
      '.ev-renkler{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 4px}' +
      '.ev-renk{display:block;width:34px;height:34px;border-radius:50%;border:1px solid rgba(0,0,0,.12);cursor:pointer;position:relative;box-sizing:border-box;transition:transform .12s}' +
      '.ev-renk:hover{transform:scale(1.08)}' +
      '.ev-renk.active{box-shadow:0 0 0 2px #fff,0 0 0 4px #290b13}' +
      '.ev-not{font-size:11px;color:#8d857c;margin:8px 0 0;line-height:1.5}' +
      /* 3D karesi */
      '.ev3d-kap{display:none;position:relative;background:linear-gradient(180deg,#f4f3f0 0%,#ebe9e5 55%,#e0ddd8 100%);border-radius:14px;overflow:hidden;width:100%;box-sizing:border-box}' +
      '.product-profile-1 .col-lg-6>.ev3d-kap{flex:0 0 100% !important;width:100% !important;max-width:100% !important;min-width:0 !important}' +
      '.ev3d-kap model-viewer{display:block;width:100%;height:100%;background:transparent;outline:none !important;--poster-color:transparent;--progress-bar-color:#290b13;--progress-bar-height:2px}' +
      '.ev3d-not{position:absolute;left:16px;bottom:14px;font-size:11px;letter-spacing:.08em;color:#6f6861;text-transform:uppercase;pointer-events:none}' +
      '.ev3d-pill{position:absolute;top:14px;right:14px;z-index:7;display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 14px 0 12px;border-radius:999px;background:rgba(255,255,255,.85);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(41,11,19,.2);color:#290b13;font-size:12px;letter-spacing:.03em;font-family:inherit;cursor:pointer;line-height:1;white-space:nowrap;transition:background .2s}' +
      '.ev3d-pill:hover{background:#fff}.ev3d-pill svg{width:15px;height:15px;flex:0 0 auto}' +
      '.ev3d-zoom{position:absolute;left:14px;top:14px;z-index:7;display:flex;flex-direction:column;gap:6px}' +
      '.ev3d-zoom button{width:34px;height:34px;border-radius:50%;border:1px solid rgba(41,11,19,.2);background:rgba(255,255,255,.85);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#290b13;font:500 17px/1 inherit;cursor:pointer;display:flex;align-items:center;justify-content:center}' +
      '.ev3d-zoom button.sifirla{font-size:13px}' +
      '.product-profile-1 .nazze-thumbs-rail .nazze-thumb.ev3d-thumb{display:flex !important;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:#f1ece4 !important;color:#290b13;cursor:pointer;text-align:center;user-select:none}' +
      '.nazze-thumb.ev3d-thumb svg{width:26px;height:26px;margin-bottom:4px}.nazze-thumb.ev3d-thumb b{font-size:15px;font-weight:600;letter-spacing:.02em;line-height:1}.nazze-thumb.ev3d-thumb small{font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#8d857c;line-height:1.2}' +
      '.nazze-thumb.ev3d-thumb.active{background:#fff !important}' +
      '@media (min-width:992px){.ev3d-pill-3d{display:none}}' +
      '.ev-varyantlar{margin-bottom:14px}.ev-varyantlar .ev-varyant{min-width:72px;justify-content:center;font-weight:600}' +
      '.ev-komb{margin:14px 0 4px;padding:12px 14px;border:1px solid #e6e1da;border-radius:12px;background:#faf8f5}' +
      '.ev-komb-ust{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ev-komb-b{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8a8378;margin-right:auto}' +
      '.ev-komb-kopyala,.ev-komb-paylas{font-size:11px;padding:4px 9px;border-radius:999px;border:1px solid #d8d2c9;background:#fff;color:#290b13;cursor:pointer;line-height:1.2}.ev-komb-kopyala:hover,.ev-komb-paylas:hover{border-color:#290b13}' +
      '.ev-komb-kod{font-family:"Space Mono",monospace;font-size:20px;font-weight:700;letter-spacing:.04em;color:#290b13;margin:8px 0 2px;word-break:break-all}' +
      '.ev-komb-metin{font-size:12px;color:#4a3a36;line-height:1.5}.ev-komb-not{margin:8px 0 0;font-size:11px;color:#8d857c;line-height:1.5}.ev-komb-not a{color:#290b13;text-decoration:underline}' +
      '@media (max-width:991px){.ev3d-kap{border-radius:0}.ev3d-not{display:none}}';
    document.head.appendChild(st);
  }

  /* ---------- secenekler kutusu ---------- */
  function secenekKur() {
    var kutu = document.getElementById('ev-secenekler');
    if (!kutu || kutu.dataset.kuruldu) return !!kutu;
    kutu.dataset.kuruldu = '1';
    var html = '';
    if (V) {
      html += '<div class="ev-etiket">Model: <strong class="secili-varyant">' + esc(cur().ad) + '</strong></div>' +
        '<div class="ev-parcalar ev-varyantlar">' + V.map(function (v, i) {
          return '<button type="button" class="ev-parca ev-varyant' + (i === vi ? ' active' : '') + '" data-v="' + i + '">' + esc(v.ad) + '</button>';
        }).join('') + '</div>';
    }
    var P = cur().parcalar;
    html += '<div class="ev-etiket">Renk' + (P.length > 1 ? ' <span class="ev-parca-adi"></span>' : '') + ': <strong class="secili-renk-adi">' + esc(secim[0]) + '</strong></div>';
    if (P.length > 1) {
      html += '<div class="ev-parcalar">' + P.map(function (p, i) {
        return '<button type="button" class="ev-parca' + (i === 0 ? ' active' : '') + '" data-i="' + i + '"><span class="ev-nokta" style="background:' + HEX[p.renk] + '"></span>' + esc(p.ad) + '</button>';
      }).join('') + '</div>';
    }
    function grup(ad, liste) {
      return '<div class="ev-grup">' + ad + '</div><div class="ev-renkler">' + liste.map(function (r) {
        return '<a href="javascript:;" class="ev-renk" data-renk="' + esc(r[0]) + '" title="' + esc(r[0]) + '" style="background:' + r[1] + '"></a>';
      }).join('') + '</div>';
    }
    html += grup('Standart renkler', R.standart || []) + grup('Katalog renkleri', R.katalog || []);
    html += '<p class="ev-not">' + (V ? 'Önce modeli, sonra rengi seçin; ' : (P.length > 1 ? 'Önce parçayı, sonra rengi seçin; ' : 'Rengi seçin; ')) + 'ürün 3D olarak seçtiğiniz renkte gösterilir. Fotoğraflar örnek renktedir.</p>';
    /* kombinasyon kodu MUSTERIYE GOSTERILMEZ (omer kararı, 12.09): secim gizli ozel alanla siparise islenir (ozelAlanYaz); ?k=KOD baglantisi ve kodYukle() arka planda calismaya devam eder. */
    kutu.innerHTML = html;
    kutu.addEventListener('click', function (e) {
      var kb = e.target.closest('.ev-komb-kopyala'); if (kb) { kopyala(kombKodu(), kb, 'Kopyalandı'); return; }
      var pb2 = e.target.closest('.ev-komb-paylas'); if (pb2) { kopyala(paylasLinki(), pb2, 'Bağlantı kopyalandı'); return; }
      var gb = e.target.closest('.ev-komb-gir'); if (gb) { var k = prompt('Kombinasyon kodunu yapıştır (örn. ' + kombKodu() + ')'); if (k && !kodYukle(k)) alert('Kod bu ürüne ait değil ya da hatalı.'); return; }
      var vb = e.target.closest('.ev-varyant');
      if (vb) { varyantSec(+vb.dataset.v); return; }
      var pb = e.target.closest('.ev-parca');
      if (pb) { aktif = +pb.dataset.i; guncelle(); return; }
      var rb = e.target.closest('.ev-renk');
      if (rb) { secim[aktif] = rb.dataset.renk; renkSecildi = true; guncelle(); boya(aktif); if (!acik) modSec(true); }
    });
    guncelle();
    return true;
  }
  function guncelle() {
    var kutu = document.getElementById('ev-secenekler'); if (!kutu) return;
    kutu.querySelectorAll('.ev-parca').forEach(function (b, i) {
      b.classList.toggle('active', i === aktif);
      var n = b.querySelector('.ev-nokta'); if (n) n.style.background = HEX[secim[i]];
    });
    kutu.querySelectorAll('.ev-renk').forEach(function (a) { a.classList.toggle('active', a.dataset.renk === secim[aktif]); });
    var ad = kutu.querySelector('.secili-renk-adi'); if (ad) ad.textContent = secim[aktif];
    var pa = kutu.querySelector('.ev-parca-adi'); if (pa) pa.textContent = '(' + cur().parcalar[aktif].ad + ')';
    kutu.querySelectorAll('.ev-varyant').forEach(function (b, i) { b.classList.toggle('active', i === vi); });
    var sv = kutu.querySelector('.secili-varyant'); if (sv) sv.textContent = cur().ad;
    kombYenile();
  }
  /* ---------- kombinasyon kodu ---------- */
  var KOD = (R.kodlar || {});
  function kombKodu() {   /* ORBE-D-10 | KUBO-09-13-11-13-09-13-09 | TORII-08 */
    var p = [u.kod || (u.isim || 'NZ').toUpperCase()];
    if (V) p.push(cur().harf || cur().ad.charAt(0).toUpperCase());
    secim.forEach(function (r) { p.push(KOD[r] || '??'); });
    return p.join('-');
  }
  function kombMetin() {
    var P = cur().parcalar;
    var t = (V ? 'Model: ' + cur().ad + ' · ' : '') + P.map(function (p, i) { return (P.length > 1 ? p.ad + ': ' : 'Renk: ') + secim[i]; }).join(' · ');
    return t;
  }
  function kodYukle(k) {
    k = String(k || '').trim().toUpperCase().replace(/\s+/g, '');
    var parca = k.split('-'); var ad = u.kod || (u.isim || '').toUpperCase();
    if (parca.shift() !== ad) return false;
    if (V) { var h = parca.shift(); var i = V.findIndex(function (v) { return (v.harf || v.ad.charAt(0).toUpperCase()) === h; }); if (i < 0) return false; if (i !== vi) varyantSec(i); }
    var P = cur().parcalar; if (parca.length !== P.length) return false;
    var adlar = Object.keys(KOD), yeni = [];
    for (var j = 0; j < parca.length; j++) { var renk = adlar.filter(function (n) { return KOD[n] === parca[j]; })[0]; if (!renk) return false; yeni.push(renk); }
    secim = yeni; renkSecildi = true; guncelle(); P.forEach(function (_, i) { boya(i); });
    return true;
  }
  function kombYenile() {
    var kutu = document.getElementById('ev-secenekler'); if (!kutu) return;
    var kk = kutu.querySelector('.ev-komb-kod'), km = kutu.querySelector('.ev-komb-metin');
    if (kk) kk.textContent = kombKodu();
    if (km) km.textContent = kombMetin();
    ozelAlanYaz();
  }
  /* Qukasoft ozel alani: addCart() div[data-product-special-fields=ID] icindeki .field-input'lari special_field[ad]=deger olarak sepete gonderir.
     Canlida "Renk Kombinasyonu" ozel alani panelde tanimlanir; tema kutuyu basarsa doldururuz, basmazsa gizli girdi olusturup doldururuz. */
  function ozelAlanYaz() {
    var pp = document.querySelector('.product-profile-1'); if (!pp) return;
    var idEl = pp.querySelector('[data-product-id]'); var pid = idEl ? idEl.getAttribute('data-product-id') : (u.urun_id || '0');
    var div = document.querySelector('div[data-product-special-fields="' + pid + '"]');
    if (!div) { div = document.createElement('div'); div.setAttribute('data-product-special-fields', pid); div.className = 'ev-ozel-alan'; div.style.display = 'none'; var vb = pp.querySelector('.variant-box') || pp; vb.appendChild(div); }
    var inp = div.querySelector('.field-input[name="Renk Kombinasyonu"]');
    if (!inp) { inp = document.createElement('input'); inp.type = 'hidden'; inp.className = 'field-input'; inp.name = 'Renk Kombinasyonu'; inp.setAttribute('data-required', '0'); div.appendChild(inp); }
    inp.value = kombKodu() + ' | ' + kombMetin();
  }
  function paylasLinki() {
    var q = new URLSearchParams(location.search); var uq = q.get('u');   /* test ortami: ?u=slug korunur */
    return location.origin + location.pathname + '?' + (uq ? 'u=' + encodeURIComponent(uq) + '&' : '') + 'k=' + kombKodu();
  }
  function kopyala(metin, dugme, mesaj) {
    function ok() { if (dugme) { var e = dugme.textContent; dugme.textContent = mesaj; setTimeout(function () { dugme.textContent = e; }, 1400); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(metin).then(ok, function () { eskiKopya(metin); ok(); });
    else { eskiKopya(metin); ok(); }
  }
  function eskiKopya(t) { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); }
  /* varyant degisimi: 3D modeli, renk secimini, galeriyi, olcu semasini ve (varsa) fiyati guncelle */
  function varyantSec(i) {
    if (!V || i === vi || !V[i]) return;
    var eskiSecim = secim.slice();
    vi = i; aktif = 0;
    var P = cur().parcalar;
    /* kullanici renk sectiyse secimi koru; secmediyse varyantin kendi varsayilan rengi (Duz Apricot / Yivli RGB Blue) */
    secim = P.map(function (p, k) { return (renkSecildi && eskiSecim.length === P.length && HEX[eskiSecim[k]]) ? eskiSecim[k] : p.renk; });
    var kutu = document.getElementById('ev-secenekler');
    if (kutu) { delete kutu.dataset.kuruldu; var yeni = kutu.cloneNode(false); kutu.parentNode.replaceChild(yeni, kutu); secenekKur(); }
    if (mv) { mv.setAttribute('src', KOK + cur().glb); mv.setAttribute('camera-orbit', cur().kamera || u.kamera || '35deg 75deg auto'); }
    /* galeri: varyantin ilk fotografina git (3D acik degilse) */
    var ilk = (cur().hero || [])[0], tum = Array.isArray(u.hero) ? u.hero : [u.hero];
    var idx = ilk ? tum.indexOf(ilk) : -1;
    if (idx >= 0 && car && !acik) {
      try { if (window.jQuery && jQuery.fn.carousel) jQuery(car).carousel(idx); } catch (e) {}
      var rail = col && col.querySelector('.nazze-thumbs-rail');
      if (rail) rail.querySelectorAll('.nazze-thumb').forEach(function (t) { t.classList.toggle('active', t.dataset.idx === String(idx)); });
    }
    var fig = document.querySelector('#nz-olcufig img');
    if (fig) { var src = KOK + 'olcu/sema-' + u.slug + '-' + cur().kod + '.png'; fig.src = src; var a = fig.closest('a'); if (a) a.href = src; }
    var f = cur().fiyat != null ? cur().fiyat : u.fiyat;
    if (f != null) document.querySelectorAll('.sale-price').forEach(function (e) { e.textContent = String(f).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' TL'; });
    var adSpan = document.querySelector('.ev3d-varyant-adi'); if (adSpan) adSpan.textContent = cur().ad;
  }

  /* ---------- 3D karesi ---------- */
  function pil(cls, metin) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ev3d-pill ' + cls;
    b.innerHTML = IKON + '<span>' + metin + '</span>';
    return b;
  }
  function kur() {
    col = document.querySelector('.product-profile-1 .col-lg-6');
    car = col && col.querySelector('.carousel');
    if (!col || !car) return false;
    if (col.querySelector('.ev3d-kap')) return true;
    stil();
    kap = document.createElement('div'); kap.className = 'ev3d-kap';
    kap.innerHTML = '<div class="ev3d-not">Sürükle: döndür · Tekerlek / iki parmak: yakınlaştır</div>' +
      '<div class="ev3d-zoom"><button type="button" data-z="in" title="Yakınlaştır">+</button><button type="button" data-z="out" title="Uzaklaştır">−</button><button type="button" class="sifirla" data-z="reset" title="Görünümü sıfırla">⟲</button></div>';
    var geri = pil('ev3d-pill-foto', 'Fotoğraflar');
    geri.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); modSec(false); });
    kap.appendChild(geri);
    kap.querySelector('.ev3d-zoom').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !mv) return;
      if (b.dataset.z === 'reset') { mv.cameraTarget = 'auto auto auto'; mv.fieldOfView = 'auto'; mv.cameraOrbit = cur().kamera || u.kamera || '35deg 75deg auto'; mv.setAttribute('auto-rotate', ''); return; }
      var f = mv.getFieldOfView(); mv.fieldOfView = Math.max(8, Math.min(60, f * (b.dataset.z === 'in' ? 0.8 : 1.25))) + 'deg';
    });
    car.parentNode.insertBefore(kap, car.nextSibling);
    var ac = pil('ev3d-pill-3d', '3D Renk Önizleme');
    ac.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); modSec(true); });
    car.appendChild(ac);
    rayKur();
    document.addEventListener('click', function (e) {
      var th = e.target.closest('.nazze-thumb');
      if (th && !th.classList.contains('ev3d-thumb') && acik) modSec(false);
    }, true);
    return true;
  }
  function rayKur() {
    var rail = col.querySelector('.nazze-thumbs-rail');
    if (!rail) return false;
    if (rail.querySelector('.ev3d-thumb')) return true;
    var tile = document.createElement('div'); tile.className = 'nazze-thumb ev3d-thumb'; tile.title = '3D Renk Önizleme';
    tile.innerHTML = IKON + '<b>3D</b><small>Renk Önizleme</small>';
    tile.addEventListener('click', function (e) { e.stopPropagation(); modSec(true); });
    rail.appendChild(tile);
    try {
      new MutationObserver(function () {
        if (tile.classList.contains('nazze-hidden')) tile.classList.remove('nazze-hidden');
        if (!acik) return;
        if (!tile.classList.contains('active')) tile.classList.add('active');
        rail.querySelectorAll('.nazze-thumb.active').forEach(function (x) { if (x !== tile) x.classList.remove('active'); });
      }).observe(rail, { attributes: true, subtree: true, attributeFilter: ['class'] });
    } catch (e) {}
    return true;
  }
  function modelYukle() {
    if (mv) return;
    function olustur() {
      if (mv) return;
      mv = document.createElement('model-viewer');
      mv.setAttribute('src', KOK + cur().glb);
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('disable-zoom', '');
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('rotation-per-second', '8deg');
      mv.setAttribute('shadow-intensity', '0.85');
      mv.setAttribute('shadow-softness', '0.8');
      mv.setAttribute('environment-image', KOK + (O.ortam || 'studyo.hdr'));
      mv.setAttribute('tone-mapping', 'neutral');
      mv.setAttribute('exposure', String(O.exposure || 1.0));
      mv.setAttribute('camera-orbit', cur().kamera || u.kamera || '35deg 75deg auto');
      mv.setAttribute('max-camera-orbit', 'auto 92deg 220%');
      mv.setAttribute('min-camera-orbit', 'auto auto 28%');
      mv.setAttribute('interaction-prompt', 'none');
      mv.setAttribute('alt', u.ad + ' 3D önizleme');
      mv.addEventListener('load', function () { cur().parcalar.forEach(function (_, i) { boya(i); }); });
      /* zoom: sayfa kaydirmayi calmamak icin sadece sahneye dokununca */
      mv.addEventListener('pointerdown', function () { mv.removeAttribute('disable-zoom'); });
      mv.addEventListener('touchstart', function () { mv.removeAttribute('disable-zoom'); }, { passive: true });
      mv.addEventListener('pointerleave', function () { mv.setAttribute('disable-zoom', ''); });
      mv.addEventListener('dblclick', function () { mv.cameraTarget = 'auto auto auto'; mv.fieldOfView = 'auto'; mv.cameraOrbit = u.kamera || '35deg 75deg auto'; });
      kap.insertBefore(mv, kap.firstChild);
    }
    if (window.customElements && customElements.get('model-viewer')) { olustur(); return; }
    var s = document.createElement('script'); s.type = 'module';
    s.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
    s.onload = olustur; document.head.appendChild(s);
  }
  function boya(i) {
    if (!mv || !mv.model) return;
    var p = cur().parcalar[i], hex = HEX[secim[i]]; if (!p || !hex) return;
    var lin = hex2lin(hex), mats = mv.model.materials;
    for (var k = 0; k < mats.length; k++) if (mats[k].name === p.mat) mats[k].pbrMetallicRoughness.setBaseColorFactor(lin);
  }
  function modSec(uc) {
    if (!!uc === acik) return;
    acik = !!uc;
    var tile = col.querySelector('.ev3d-thumb');
    if (acik) {
      var im = car.querySelector('.carousel-item.active img') || car.querySelector('.carousel-item img');
      var h = im ? im.getBoundingClientRect().height : 0;
      if (!h || h < 200) h = sonYuk || Math.round(Math.min(car.getBoundingClientRect().height || 0, window.innerHeight * 0.8)) || 420;
      if (window.innerWidth >= 992) h = Math.min(h, window.innerHeight - 140);
      h = Math.max(360, Math.round(h)); sonYuk = h;
      kap.style.height = h + 'px';
      car.style.display = 'none';
      kap.style.display = 'block';
      if (tile) { col.querySelectorAll('.nazze-thumb.active').forEach(function (x) { x.classList.remove('active'); }); tile.classList.add('active'); }
      modelYukle();
    } else {
      kap.style.display = 'none';
      car.style.display = '';
      if (tile) tile.classList.remove('active');
    }
  }

  /* tema (scripts.js applyTitle) h1'i her seferinde title-case yapiyor: "MagSafe" -> "Magsafe". Icinde <br> varsa dokunmuyor;
     gizli bir <br> ile adi koruyoruz. CANLIYA GECISTE: scripts.js applyTitle'a marka istisnasi (MagSafe) eklenecek. */
  function h1Duzelt() {
    var h1 = document.querySelector('.product-profile-1 h1.title');
    if (h1 && h1.textContent.replace(/\s+/g, ' ').trim() !== u.ad) { h1.innerHTML = esc(u.ad) + '<br style="display:none">'; h1.dataset.nazzeFixed = 'true'; }
  }
  function basla() {
    stil(); secenekKur(); h1Duzelt(); [300, 1000, 2500].forEach(function (t) { setTimeout(h1Duzelt, t); });
    try { var kp = new URLSearchParams(location.search).get('k'); if (kp) { kodYukle(kp); modSecSonra = true; } } catch (e) {}
    if (!kur()) { var t = setInterval(function () { if (kur()) { clearInterval(t); if (modSecSonra) modSec(true); } }, 500); setTimeout(function () { clearInterval(t); }, 15000); }
    else if (modSecSonra) modSec(true);
    var r = setInterval(function () { if (col && rayKur()) clearInterval(r); }, 500); setTimeout(function () { clearInterval(r); }, 12000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', basla); else basla();
})();

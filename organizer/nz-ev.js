/* ===== NAZZE EV ORGANIZATOR — canli modul (12.09.2026) =====
   Kaynak: nazze-assets/organizer/nz-ev.js (jsDelivr). nz-set.js'teki yukleyici blok bu dosyayi cagirir.
   Veri: organizer/urunler.json (20 urun, 20 renk, kodlar). GLB/HDR/sema ayni klasorden.
   Uc parca:
   1) URUN SAYFASI (slug urunler.json'da): renk/parca/model secici + 3D onizleme + "Urun Ozellikleri" (olcu, sema, hikaye)
      + fiyat notu + MagSafe baslik istisnasi + gizli "Renk Kombinasyonu" ozel alani (siparise otomatik islenir).
   2) KATEGORI SAYFASI (/ev-organizator): baslik + rozet ("3D renk onizleme · N parca") + cark renk noktalari.
   3) MENU: Magaza acilir menusune / ust sekmeye "Ev Organizator" (+Yeni rozeti), Ticaret -> Hakkinda alti, Hakkinda en sona.
   Surum: ?v= parametresi yukleyicide. */
(function () {
  'use strict';
  if (window.__nzEv) return; window.__nzEv = true;
  var KOK = 'https://cdn.jsdelivr.net/gh/oosendur-cell/nazze-assets@main/organizer/';
  var VERI = KOK + 'urunler.json';
  var LANSMAN_ROZET = true;   /* ust menudeki "Yeni" rozeti; lansman sonrasi false */

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function cm(n) { return String(n).replace('.', ','); }
  function hazir(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  /* =============== 3) MENU =============== */
function menuKur() {
  'use strict';
  var YOL = '/ev-organizator', AD = 'Ev Organizatör';
  function stil() {
    if (document.getElementById('nz-evo-stil')) return;
    var st = document.createElement('style'); st.id = 'nz-evo-stil';
    st.textContent = '.nz-yeni{display:inline-block;margin-left:6px;padding:2px 6px 1px;border-radius:999px;background:#290b13;color:#fff;font-size:9px;line-height:1.2;letter-spacing:.08em;text-transform:uppercase;vertical-align:middle;position:relative;top:-1px}' +
      '#nz-evo-li>a{white-space:nowrap;flex-direction:row !important;align-items:center;gap:6px}#nz-evo-li>a .nz-yeni{margin-left:0;top:0}header.mobile .nz-yeni{background:#290b13}';
    document.head.appendChild(st);
  }
  function ekle() {
    try {
      stil();
      /* masaustu: Magaza acilir menusu */
      var altUl = document.querySelector('ul.single-menu li:first-child > ul.single-sub-menu');
      if (altUl && !altUl.querySelector('a[href="' + YOL + '"]')) {
        var li = document.createElement('li'); li.id = 'nz-evo-alt';
        li.innerHTML = '<a href="' + YOL + '" class="single-item">' + AD + '</a>';
        altUl.appendChild(li);
      }
      /* masaustu: ust menu, Magaza'dan sonra */
      var ul = document.querySelector('ul.single-menu');
      if (ul && !document.getElementById('nz-evo-li')) {
        var li2 = document.createElement('li'); li2.id = 'nz-evo-li';
        li2.innerHTML = '<a href="' + YOL + '" class="sub-single-item">' + AD + '<span class="nz-yeni">Yeni</span></a>';
        var magaza = ul.querySelector(':scope > li');
        if (magaza && magaza.nextSibling) ul.insertBefore(li2, magaza.nextSibling); else ul.appendChild(li2);
      }
      /* mobil: Magaza alt listesi + ust seviye */
      var mAlt = document.querySelector('header.mobile .categories ul.categories-list-21');
      if (mAlt && !mAlt.querySelector('a[href*="' + YOL + '"]')) {
        var mli = document.createElement('li'); mli.className = 'sc-evo';
        mli.innerHTML = '<a href="' + YOL + '"><span class="name ">' + AD + '</span><div class="clearfix"></div></a>';
        mAlt.appendChild(mli);
      }
      var mul = document.querySelector('header.mobile .categories > ul');
      if (mul && !document.getElementById('nz-evo-mli')) {
        var mli2 = document.createElement('li'); mli2.id = 'nz-evo-mli';
        mli2.innerHTML = '<a href="' + YOL + '"><span class="name float-left">' + AD + '<span class="nz-yeni">Yeni</span></span><div class="clearfix"></div></a>';
        var ilk = mul.querySelector(':scope > li');
        if (ilk && ilk.nextSibling) mul.insertBefore(mli2, ilk.nextSibling); else mul.appendChild(mli2);
      }
      /* Ticaret: ust sekme olmaktan cikar, Hakkinda acilir menusune "Ticaret Programi" olarak gir (omer, 12.09) */
      var liler = ul ? ul.querySelectorAll(':scope > li') : [];
      var ticaret = null, hakkinda = null;
      for (var i = 0; i < liler.length; i++) {
        var t = (liler[i].querySelector(':scope > a') || {}).textContent || '';
        if (/^\s*Ticaret\s*$/.test(t)) ticaret = liler[i];
        if (/Hakkında/.test(t) && liler[i].querySelector('ul')) hakkinda = liler[i];
      }
      if (ticaret && hakkinda && !document.getElementById('nz-tic-alt')) {
        var hul = hakkinda.querySelector('ul.single-sub-menu');
        var tli = document.createElement('li'); tli.id = 'nz-tic-alt';
        tli.innerHTML = '<a href="/ticaret-programi" class="single-item">Ticaret Programı</a>';
        var ilet = hul.querySelector('a[href*="iletisim"]');
        if (ilet) hul.insertBefore(tli, ilet.closest('li')); else hul.appendChild(tli);
        ticaret.parentNode.removeChild(ticaret);
      }
      /* mobil: Ticaret ust maddesini kaldir, Hakkinda alt listesine "Ticaret Programi" ekle (tema mobil menuyu gec yeniden kurabiliyor; her denemede kontrol) */
      var mliler = mul ? mul.querySelectorAll(':scope > li') : [];
      for (var j = 0; j < mliler.length; j++) {
        var mt = (mliler[j].querySelector(':scope > a') || {}).textContent || '';
        if (/^\s*Ticaret\s*$/.test(mt.replace(/\s+/g, ' '))) mliler[j].parentNode.removeChild(mliler[j]);
      }
      var mhak = null; mliler = mul ? mul.querySelectorAll(':scope > li') : [];
      for (var k = 0; k < mliler.length; k++) { var mk = (mliler[k].querySelector(':scope > a') || {}).textContent || ''; if (/Hakkında/.test(mk)) mhak = mliler[k]; }
      var mhul = mhak && mhak.querySelector('ul');
      if (mhul && !mhul.querySelector('a[href*="ticaret-programi"]')) {
        var mtl = document.createElement('li'); mtl.id = 'nz-tic-malt';
        var ornek = mhul.querySelector('li a .name');   /* tema hangi yapiyi kullaniyorsa ona uy */
        mtl.innerHTML = ornek ? '<a href="/ticaret-programi"><span class="name ">Ticaret Programı</span><div class="clearfix"></div></a>' : '<a href="/ticaret-programi">Ticaret Programı</a>';
        var milet = mhul.querySelector('a[href*="iletisim"]');
        if (milet) mhul.insertBefore(mtl, milet.closest('li')); else mhul.appendChild(mtl);
      }
      /* Hakkinda en sona, Ic Mimarlik onun solunda (omer, 12.09) — Ic Mimarlik sekmesi tema JS'iyle sonradan geldigi icin her denemede kontrol */
      var icm = document.getElementById('nz-icm-li');
      if (ul && icm && hakkinda && hakkinda.nextElementSibling) ul.appendChild(hakkinda);
      var micm = document.getElementById('nz-icm-mli');
      if (mul && micm && mhak && mhak.nextElementSibling) mul.appendChild(mhak);
    } catch (e) {}
  }
  ekle(); [800, 1500, 3000, 5000].forEach(function (ms) { setTimeout(ekle, ms); });   /* tema menuyu gec kurarsa */
}

  /* =============== 2) KATEGORI SAYFASI =============== */
  function kategoriKur(veri) {
    var IKON = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>';
    var RENKLER = (veri.renkler.standart || []).concat(veri.renkler.katalog || []);
    if (!document.getElementById('nz-evkat-stil')) {
      var st = document.createElement('style'); st.id = 'nz-evkat-stil';
      st.textContent = '.ev-kat-baslik{padding:6px 15px 6px}.ev-kat-baslik h1{font-size:28px;font-weight:500;letter-spacing:-.01em;margin:0;color:#111}' +
        '.category-short-description{max-width:720px;color:#6b6b6b;font-size:14px;line-height:1.6;padding:0 15px 16px}' +
        '.ev-3d-rozet{display:inline-flex;align-items:center;gap:5px;margin-top:8px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#290b13;border:1px solid rgba(41,11,19,.2);border-radius:999px;padding:5px 10px;background:#fff}' +
        '.ev-kart .prices{flex-wrap:wrap}.ev-fiyat-not{display:block;flex-basis:100%;width:100%;font-size:11px;font-weight:400;color:#8d857c;letter-spacing:.02em;margin-top:3px;line-height:1.3}';
      document.head.appendChild(st);
    }
    function isle() {
      var kisa = document.querySelector('.category-short-description');
      if (kisa && !document.querySelector('.ev-kat-baslik')) { var b = document.createElement('div'); b.className = 'ev-kat-baslik'; b.innerHTML = '<h1>Ev Organizatör</h1>'; kisa.parentNode.insertBefore(b, kisa); }
      document.querySelectorAll('.card-product').forEach(function (kart) {
        if (kart.dataset.evKart) return;
        var a = kart.querySelector('a[href]'); if (!a) return;
        var slug = (a.getAttribute('href') || '').split('?')[0].replace(/\/+$/, '').split('/').pop();
        var u = veri.urunler.filter(function (x) { return x.slug === slug; })[0]; if (!u) return;
        kart.dataset.evKart = '1'; kart.classList.add('ev-kart');
        var icerik = kart.querySelector('.recently-viewed-content, .card-product-inner');
        if (icerik && !kart.querySelector('.ev-3d-rozet')) {
          var sp = document.createElement('span'); sp.className = 'ev-3d-rozet';
          sp.innerHTML = IKON + '3D renk önizleme · ' + (u.varyantlar && u.varyantlar.length ? u.varyantlar.length + ' model' : u.parcalar.length + ' parça');
          icerik.appendChild(sp);
        }
        if (u.fiyat_not) { var pr = kart.querySelector('.prices'); if (pr && !pr.querySelector('.ev-fiyat-not')) { var fn = document.createElement('div'); fn.className = 'ev-fiyat-not'; fn.textContent = u.fiyat_not; pr.appendChild(fn); } }
        /* tema carki (.nazze-color-wheel) .color-options icindeki .color-dot'lardan beslenir */
        var co = kart.querySelector('.color-options');
        if (!co) { co = document.createElement('div'); co.className = 'color-options'; co.style.display = 'none'; var pg = kart.querySelector('.price-group'); (pg || icerik || kart).insertBefore(co, (pg || icerik || kart).firstChild); }
        if (!co.querySelector('.color-dot')) { co.setAttribute('data-yuklendi', '1'); co.innerHTML = RENKLER.map(function (r) { return '<span class="color-dot" title="' + esc(r[0]) + '" style="background-color:' + esc(r[1]) + '"></span>'; }).join(''); }
      });
    }
    isle(); [600, 1500, 3000, 6000].forEach(function (ms) { setTimeout(isle, ms); });
    try { new MutationObserver(function () { isle(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  }

  /* =============== 1) URUN SAYFASI =============== */
  function urunHazirla(u, veri) {
    var pp = document.querySelector('.product-profile-1'); if (!pp) return false;
    document.body.classList.add('ev-organizator-urun');
    var V = Array.isArray(u.varyantlar) && u.varyantlar.length ? u.varyantlar : null;
    if (!document.getElementById('nz-evurun-stil')) {
      var st = document.createElement('style'); st.id = 'nz-evurun-stil';
      st.textContent = '.nz-hikaye{margin-bottom:34px}.nzC{display:grid;grid-template-columns:1fr 1fr;gap:4px 64px}.nzC .r{display:flex;align-items:center;gap:16px;padding:11px 0;border-bottom:1px dashed #e0dacc}.nzC .r svg{width:22px;height:22px;stroke:#2b2a26;fill:none;stroke-width:1.4;flex-shrink:0;opacity:.75}.nzC .r .t{font-size:.66rem;letter-spacing:.16em;color:#8a8378;width:74px;flex-shrink:0}.nzC .r .v{font-size:.86rem;font-weight:600;color:#2b2a26}.nz-eko{margin-top:18px;font-size:.74rem;color:#7a7466;display:flex;align-items:center;gap:8px}.nz-eko svg{width:15px;height:15px;stroke:#7a9471;fill:none;stroke-width:1.6;flex-shrink:0}@media (max-width:900px){.nzC{grid-template-columns:1fr}}' +
        /* tema varyant kutusu (Model select) ve ozel alan kutusu gizli: secim bizim pillerle yapilir, degerler arka planda dolar */
        '.ev-organizator-urun .product-profile-1 .variant-box{display:none !important}' +
        '.ev-organizator-urun [data-product-special-fields],.ev-organizator-urun [data-product-special-fields-v2]{display:none !important}' +
        '#ev-secenekler{margin:6px 0 16px}' +
        '.ev-fiyat-not{font-size:13px;color:#8d857c;letter-spacing:.02em}';
      document.head.appendChild(st);
    }
    /* secenek kutusu: tema variant-box'un yerine (varsa oraya, yoksa dugmelerin ustune) */
    if (!document.getElementById('ev-secenekler')) {
      var kutu = document.createElement('div'); kutu.id = 'ev-secenekler';
      var vb = pp.querySelector('.variant-box'), pb = pp.querySelector('.product-buttons');
      if (vb) vb.parentNode.insertBefore(kutu, vb); else if (pb) pb.parentNode.insertBefore(kutu, pb); else pp.appendChild(kutu);
    }
    /* fiyat notu (setler) */
    if (u.fiyat_not && !pp.querySelector('.ev-fiyat-not')) { var sp = pp.querySelector('.sale-price'); if (sp) { var fn = document.createElement('div'); fn.className = 'ev-fiyat-not'; fn.textContent = u.fiyat_not; sp.insertAdjacentElement('afterend', fn); } }
    /* Urun Ozellikleri akordeonu: lamba kalibi (olcu satirlari + sema + hikaye) */
    var yuvarlak = u.yuvarlak || (u.olcu && u.olcu.g === u.olcu.d && u.slug.indexOf('dairesel') !== -1);
    var olcu = u.olcu ? (yuvarlak ? 'Ø ' : '') + cm(u.olcu.g) + ' × ' + cm(u.olcu.y) + ' cm' : '—';
    var SVG = {
      olcu: '<svg viewBox="0 0 24 24"><path d="M3 21h18M6 21V8m0 0l-2 2m2-2l2 2M6 8h12M18 21V8m0 0l-2 2m2-2l2 2"></path></svg>',
      malzeme: '<svg viewBox="0 0 24 24"><path d="M12 21c-4 0-7-3-7-7 0-5 4-9 9-10 3 6 3 12-2 17zM12 21c5 0 8-2.5 8-6"></path></svg>',
      parca: '<svg viewBox="0 0 24 24"><path d="M4 7h7v7H4zM13 4h7v7h-7zM13 13h7v7h-7zM4 16h7v4H4z"></path></svg>',
      renk: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6L6 18"></path></svg>',
      bakim: '<svg viewBox="0 0 24 24"><path d="M4 12c3-4 5-6 8-6s5 2 8 6c-3 4-5 6-8 6s-5-2-8-6z"></path><circle cx="12" cy="12" r="2.5"></circle></svg>',
      uretim: '<svg viewBox="0 0 24 24"><path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z"></path><circle cx="12" cy="10.6" r="2.2"></circle></svg>'
    };
    function satir(ik, t, v) { return '<div class="r">' + SVG[ik] + '<span class="t">' + t + '</span><span class="v">' + v + '</span></div>'; }
    var parcaMetin = u.parcalar.length > 1 ? u.parcalar.length + ' parça · her parça ayrı renk' : 'Tek parça';
    if (V) parcaMetin += ' · ' + V.length + ' model: ' + V.map(function (v) { return v.ad; }).join(', ');
    var semaAd = 'sema-' + u.slug + (V ? '-' + V[0].kod : '') + '.png';
    var ISIM = u.isim || u.ad;
    var parcalar = u.parcalar.map(function (p) { return p.ad; }).join(', ');
    var hikaye = esc(u.aciklama || '') + '<br><br><strong>' + esc(ISIM) + ', ' + (yuvarlak ? 'Ø ' : '') + cm(u.olcu.g) + ' cm x ' + cm(u.olcu.y) + ' cm ölçülerindedir.</strong> Bitkisel bazlı, doğada çözünebilen biyopolimer PLA malzemeden üretilmiştir. Cam veya seramik değildir. Hafif yapısına rağmen dayanıklı ve uzun ömürlü kullanım sunar. Mat yüzeylidir; kuru veya nemli bir bezle silinerek temizlenebilir.' +
      (u.parcalar.length > 1 ? ' <strong>' + u.parcalar.length + ' parçadan oluşur</strong> (' + esc(parcalar) + '); her parçanın rengi ayrı seçilebilir.' : ' 20 Nazze renginde üretilir.') +
      (V ? ' <strong>' + V.length + ' model seçeneği vardır:</strong> ' + esc(V.map(function (v) { return v.ad; }).join(' ve ')) + '.' : '');
    var ozHtml = '<div class="card-body" style="padding:14px 36px 18px 36px;color:#4A3A36;font-size:14px;line-height:1.7;border-top:1px solid #f1f1f1">' +
      '<div class="nz-ozgrid nz-ozgrid3">' +
        '<div id="nz-ozellik" style="margin-bottom:34px"><div class="nzC">' +
          satir('olcu', 'ÖLÇÜ', olcu) + satir('malzeme', 'MALZEME', 'Biyopolimer PLA') + satir('parca', 'PARÇA', esc(parcaMetin)) +
          satir('renk', 'RENK', '20 renk seçeneği') + satir('bakim', 'BAKIM', 'Kuru veya nemli bezle temizlenebilir') + satir('uretim', 'ÜRETİM', 'Nazze/İstanbul') +
        '</div><div class="nz-eko">' + SVG.malzeme + '<span>Tüm ürünlerimiz %100 doğada çözünür, kimyasal içermez.</span></div></div>' +
        '<figure id="nz-olcufig" class="nz-olcufig"><a href="' + KOK + 'olcu/' + semaAd + '" target="_blank" rel="noopener" title="Tam boy görüntüle"><img src="' + KOK + 'olcu/' + semaAd + '" alt="Ölçü şeması" decoding="async" onerror="this.closest(\'figure\').remove()"></a></figure>' +
        '<div class="nz-hikaye nz-hikaye-kutu">' + hikaye + '</div>' +
      '</div></div>';
    function ozellikKur() {
      var kur = false;
      pp.querySelectorAll('.accordion-product').forEach(function (k) {
        var baslik = ((k.querySelector('.card-header') || {}).textContent || '').trim();
        if (!/Özellik/i.test(baslik) || k.dataset.evOz) return;
        k.dataset.evOz = '1'; var ic = k.querySelector('.collapse');
        if (ic) { ic.innerHTML = ozHtml; ic.classList.add('show'); }
        k.classList.add('nz-sabit'); var dug = k.querySelector('.acc-btn'); if (dug) { dug.removeAttribute('data-toggle'); dug.setAttribute('aria-expanded', 'true'); }
        kur = true;
      });
      return kur;
    }
    if (!ozellikKur()) { var t = 0, iv = setInterval(function () { if (ozellikKur() || ++t > 20) clearInterval(iv); }, 500); }
    var badges = pp.querySelector('.product-badges'); if (badges) badges.remove();
    return true;
  }

  function ev3dBaslat(u, R, O) {

  var KOK = O.kok;
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
      /* canli: fiyat var, tema ozet kutusu (#nz-summary) lambalardaki gibi kalir */
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
    kutu.querySelectorAll('.ev-parca:not(.ev-varyant)').forEach(function (b, i) {
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
  /* tema varyant secimi (Erpin select[data-variant-name=Model]): bizim pil -> select; boylece addCart dogru varyanti gonderir */
  function temaVaryantSec() {
    if (!V) return;
    var sel = document.querySelector('.product-profile-1 .variant-box select');
    if (!sel) return;
    var op = [...sel.options].find(function (o) { return (o.value || o.text).trim().toLocaleLowerCase('tr') === cur().ad.toLocaleLowerCase('tr'); });
    if (op && sel.value !== op.value) { sel.value = op.value; try { if (window.jQuery) jQuery(sel).trigger('change'); else sel.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {} }
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
    /* Erpin 5.2 ozel alani v2 kutusuyla basiyor: div[data-product-special-fields-v2=ID] > input.field-input[name=<alan id>] */
    var div = document.querySelector('div[data-product-special-fields-v2="' + pid + '"]') || document.querySelector('div[data-product-special-fields="' + pid + '"]');
    if (!div) { div = document.createElement('div'); div.setAttribute('data-product-special-fields', pid); div.className = 'ev-ozel-alan'; div.style.display = 'none'; var vb = pp.querySelector('.variant-box') || pp; vb.appendChild(div); }
    /* tema kutuyu bastiysa icindeki metin girdisini kullan (adi ne olursa olsun); yoksa gizli girdi olustur */
    var inp = div.querySelector('.field-input[data-label="Renk Kombinasyonu"]') || div.querySelector('.field-input[name="Renk Kombinasyonu"]') || div.querySelector('input.field-input[type="text"], textarea.field-input, input.field-input:not([type=file]):not([type=checkbox]):not([type=radio])');
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
    temaVaryantSec();
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
    stil(); secenekKur(); h1Duzelt(); temaVaryantSec(); [300, 1000, 2500].forEach(function (t) { setTimeout(h1Duzelt, t); });
    try { var kp = new URLSearchParams(location.search).get('k'); if (kp) { kodYukle(kp); modSecSonra = true; } } catch (e) {}
    if (!kur()) { var t = setInterval(function () { if (kur()) { clearInterval(t); if (modSecSonra) modSec(true); } }, 500); setTimeout(function () { clearInterval(t); }, 15000); }
    else if (modSecSonra) modSec(true);
    var r = setInterval(function () { if (col && rayKur()) clearInterval(r); }, 500); setTimeout(function () { clearInterval(r); }, 12000);
  }
  basla();

  }

  /* =============== BASLAT =============== */
  hazir(function () {
    menuKur();
    var yol = location.pathname.replace(/\/+$/, '');
    var slug = yol.split('/').pop();
    var kategori = (yol === '/ev-organizator');
    var urunSayfa = !!document.querySelector('.product-profile-1');
    if (!kategori && !urunSayfa) return;
    fetch(VERI).then(function (r) { return r.json(); }).then(function (veri) {
      if (kategori) { kategoriKur(veri); return; }
      var u = veri.urunler.filter(function (x) { return x.slug === slug; })[0];
      if (!u) return;
      if (urunHazirla(u, veri)) ev3dBaslat(u, veri.renkler, { ortam: veri.ortam, exposure: veri.exposure, kok: KOK });
    }).catch(function (e) { try { console.warn('nz-ev veri', e); } catch (x) {} });
  });
})();

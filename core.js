/* =========================================================
   CORE ENGINE – TRADING JOURNAL
   Beyin burada. UI sadece tetikler.
   ========================================================= */

/* =========================
   GLOBAL CORE
   ========================= */
window.Core = {
  kasa: {
    bakiye: 100000, // başlangıç kasa (TL)
  },
  aktifIslemler: [],
  ayarlar: {
    stopOranVarsayilan: 1, // %
    rrVarsayilan: 1,
  }
};

/* =========================
   KASA FONKSİYONLARI
   ========================= */
function kasaGuncelle(tutar) {
  Core.kasa.bakiye += tutar;
  localStorage.setItem("kasa", Core.kasa.bakiye);
}

function kasaYukle() {
  const k = localStorage.getItem("kasa");
  if (k !== null) Core.kasa.bakiye = Number(k);
}

/* =========================
   ISLEM OLUSTUR
   ========================= */
function islemOlustur(data) {
  const islem = {
    id: Date.now(),
    durum: "AKTIF",

    varlik: data.varlik,
    tip: data.tip, // HISSE / COIN
    trend: data.trend,
    zamanDilimi: data.zamanDilimi,

    girisFiyat: data.girisFiyat,
    adet: data.adet,
    tutar: data.tutar,

    stopOran: data.stopOran,
    stopFiyat: data.stopFiyat,

    teknikAnaliz: data.teknikAnaliz || {},

    tp: {
      tp1: null,
      tp2: null,
      tp3: null
    },

    acilisZamani: new Date().toISOString()
  };

  Core.aktifIslemler.push(islem);
  localStorage.setItem("aktifIslemler", JSON.stringify(Core.aktifIslemler));

  return islem;
}

/* =========================
   ISLEMLERI YUKLE
   ========================= */
function islemleriYukle() {
  const d = localStorage.getItem("aktifIslemler");
  if (d) Core.aktifIslemler = JSON.parse(d);
}

/* =========================
   MANUEL ISLEM SONLANDIR
   ========================= */
function islemSonlandir(id, fiyat) {
  const islem = Core.aktifIslemler.find(i => i.id === id);
  if (!islem || islem.durum !== "AKTIF") return;

  const sonuc = islem.adet * fiyat;
  kasaGuncelle(sonuc);

  islem.durum = "KAPANDI";
  islem.kapanisFiyat = fiyat;
  islem.kapanisZamani = new Date().toISOString();

  localStorage.setItem("aktifIslemler", JSON.stringify(Core.aktifIslemler));
}

/* =========================
   INIT
   ========================= */
(function initCore() {
  kasaYukle();
  islemleriYukle();
  console.log("CORE HAZIR", Core);
})();
/* =========================
   CORE STATE (GLOBAL BEYİN)
   ========================= */

const Core = {
  kasa: {
    bakiye: 0,
    baslangic: 0
  },

  ayarlar: {
    fiyatKontrolSuresi: 15, // saniye
    stopOraniVarsayilan: 1, // %
    tpKademeleri: [1], // 1R varsayılan
    otomatikSonlandirma: false
  },

  aktifIslemler: [],

  islemler: [],

  fiyatKaynak: {
    tip: "NONE", // YAHOO | TRADINGVIEW | MATRIX | NONE
    bagli: false
  }
};

/* =========================
   KASA
   ========================= */

function kasaBaslat(tutar) {
  Core.kasa.bakiye = Number(tutar);
  Core.kasa.baslangic = Number(tutar);
}

function kasaGuncelle(tutar) {
  Core.kasa.bakiye += Number(tutar);
}

/* =========================
   İŞLEM OLUŞTUR
   ========================= */

function islemOlustur(data) {
  const islem = {
    id: Date.now(),
    varlik: data.varlik,
    tip: data.tip, // COIN | HISSE
    trend: data.trend, // YUKSELEN | DUSEN | YATAY
    zamanDilimi: data.zamanDilimi,

    girisFiyat: data.girisFiyat,
    adet: data.adet,
    tutar: data.tutar,

    stop: {
      oran: data.stopOran,
      fiyat: data.stopFiyat,
      manuel: data.stopManuel || false
    },

    hedefler: {
      tp1: data.tp1 || null,
      tp2: data.tp2 || null,
      tp3: data.tp3 || null
    },

    teknikAnaliz: data.teknikAnaliz || {},

    durum: "AKTIF", // AKTIF | YARI_KAPANDI | KAPANDI
    acilisZamani: new Date().toISOString(),
    kapanisZamani: null,

    pnl: 0
  };

  Core.aktifIslemler.push(islem);
  return islem;
}

/* =========================
   İŞLEM KAPAT
   ========================= */

function islemKapat(islemId, sebep) {
  const index = Core.aktifIslemler.findIndex(i => i.id === islemId);
  if (index === -1) return;

  const islem = Core.aktifIslemler[index];
  islem.durum = "KAPANDI";
  islem.kapanisZamani = new Date().toISOString();
  islem.kapanisSebebi = sebep;

  Core.islemler.push(islem);
  Core.aktifIslemler.splice(index, 1);
}

/* =========================
   FİYAT KAYNAK (ALTYAPI)
   ========================= */

function fiyatKaynagiAyarla(tip) {
  Core.fiyatKaynak.tip = tip;
  Core.fiyatKaynak.bagli = true;
}

/* =========================
   DIŞARI AÇ (GLOBAL)
   ========================= */

window.Core = Core;
window.kasaBaslat = kasaBaslat;
window.kasaGuncelle = kasaGuncelle;
window.islemOlustur = islemOlustur;
window.islemKapat = islemKapat;
window.fiyatKaynagiAyarla = fiyatKaynagiAyarla;
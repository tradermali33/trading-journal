/* ================================
   CORE MOTOR v1
   Trading Journal Engine
   ================================ */

/* -------- GLOBAL STATE -------- */
const Core = {
  kasa: 0,
  aktifIslemler: [],
  ayarlar: {
    fiyatKontrolSn: 15,
    varsayilanStop: 1,
    otomatikSonlandir: false,
  }
};

/* -------- KASA -------- */
function kasaAyarla(tutar){
  Core.kasa = Number(tutar) || 0;
  kasaGuncelle();
}

function kasaGuncelle(){
  const el = document.getElementById("kasa");
  if(el) el.innerText = Core.kasa.toFixed(2) + " TL";
}

/* -------- İŞLEM -------- */
function islemBaslat(data){
  const islem = {
    id: Date.now(),
    varlik: data.varlik,
    giris: data.giris,
    adet: data.adet,
    stop: data.stop,
    tp1: data.tp1,
    tp2: data.tp2,
    tp3: data.tp3,
    trend: data.trend,
    durum: "AKTIF",
    karZarar: 0,
    acilisZamani: new Date()
  };

  Core.aktifIslemler.push(islem);
  console.log("İŞLEM AÇILDI:", islem);
  return islem;
}

/* -------- İŞLEM SONLANDIR -------- */
function islemSonlandir(id, sebep="MANUEL"){
  const islem = Core.aktifIslemler.find(i=>i.id===id);
  if(!islem) return;

  islem.durum = "KAPANDI";
  islem.kapanisSebep = sebep;
  islem.kapanisZamani = new Date();

  console.log("İŞLEM KAPANDI:", islem);
}

/* -------- RR HESAP -------- */
function rrHesapla(giris, stop, hedef){
  return ((hedef - giris) / (giris - stop)).toFixed(2);
}

/* -------- FİYAT GÜNCELLEME (API HOOK) -------- */
async function fiyatGetir(symbol){
  /*
   BURASI API NOKTASI
   - Yahoo Finance
   - Matrix
   - TradingView (ileride)
  */
  console.log("Fiyat isteniyor:", symbol);
  return null; // şimdilik boş
}

/* -------- ZAMANLAYICI -------- */
let fiyatTimer = null;

function fiyatTakibiBaslat(){
  if(fiyatTimer) clearInterval(fiyatTimer);
  fiyatTimer = setInterval(()=>{
    Core.aktifIslemler.forEach(islem=>{
      // burada TP / Stop kontrolü yapılacak
    });
  }, Core.ayarlar.fiyatKontrolSn * 1000);
}

/* -------- EXPORT -------- */
window.Core = {
  kasaAyarla,
  islemBaslat,
  islemSonlandir,
  rrHesapla,
  fiyatTakibiBaslat,
  state: Core
};
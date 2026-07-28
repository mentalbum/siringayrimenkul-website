"use client";

/** Gizlilik sayfasındaki "tercihimi değiştir" bağlantısı: kayıtlı çerez
 * kararını siler ve sayfayı yeniler — bant yeniden görünür. */
export function CerezTercihiSifirla() {
  return (
    <button
      type="button"
      onClick={() => {
        window.localStorage.removeItem("cerez-tercihi");
        window.location.reload();
      }}
      className="cursor-pointer font-semibold text-gold-dark hover:underline"
    >
      çerez tercihimi sıfırla
    </button>
  );
}

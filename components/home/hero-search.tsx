"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/ui/icons";

export function HeroSearch() {
  const router = useRouter();
  const [sorgu, setSorgu] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const q = sorgu.trim();
    router.push(q ? `/siteler?ara=${encodeURIComponent(q)}` : "/siteler");
  }

  return (
    /* action/method/name JS'siz de çalışan gerçek bir GET formu kuruyor:
       onSubmit preventDefault ettiği için tarayıcıda davranış değişmiyor, ama
       JS çalıştırmadan bakan tarama botları artık kutunun /siteler arşivine
       açıldığını görüyor (denetim 2026-08-08: ana sayfadan arşive giden tek yol
       menüydü). */
    <form
      action="/siteler"
      method="get"
      onSubmit={submit}
      role="search"
      className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-lg shadow-black/20 ring-1 ring-black/5"
    >
      <SearchIcon className="pointer-events-none ml-2 h-5 w-5 shrink-0 text-muted" />
      <input
        type="search"
        name="ara"
        value={sorgu}
        onChange={(event) => setSorgu(event.target.value)}
        placeholder="Sitenizi veya mahallenizi arayın…"
        aria-label="Site, rezidans veya mahalle arayın"
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-navy outline-none placeholder:text-muted sm:text-base"
      />
      <button
        type="submit"
        className="shrink-0 cursor-pointer rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold-dark hover:text-white sm:px-5"
      >
        Ara
      </button>
    </form>
  );
}

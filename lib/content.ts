import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { AdaBilgi, BlogPost, Mahalle, Site } from "@/lib/types";
import { haversineDistanceKm } from "@/lib/geo";

export interface AdaEntry extends AdaBilgi {
  site: Site;
}

const CONTENT_DIR = path.join(process.cwd(), "content");
const MAHALLELER_DIR = path.join(CONTENT_DIR, "mahalleler");
const SITELER_DIR = path.join(CONTENT_DIR, "siteler");
const BLOG_DIR = path.join(CONTENT_DIR, "blog");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

export function getMahalleLastModified(mahalleSlug: string): Date {
  return fs.statSync(path.join(MAHALLELER_DIR, `${mahalleSlug}.json`)).mtime;
}

export function getSiteLastModified(mahalleSlug: string, siteSlug: string): Date {
  return fs.statSync(path.join(SITELER_DIR, mahalleSlug, `${siteSlug}.json`)).mtime;
}

export function getAllMahalleler(): Mahalle[] {
  const files = fs.readdirSync(MAHALLELER_DIR).filter((file) => file.endsWith(".json"));
  return files
    .map((file) => readJson<Mahalle>(path.join(MAHALLELER_DIR, file)))
    .sort((a, b) => a.isim.localeCompare(b.isim, "tr"));
}

export function getYayindaMahalleler(): Mahalle[] {
  return getAllMahalleler().filter((mahalle) => mahalle.durum === "yayinda");
}

export function getMahalleBySlug(slug: string): Mahalle | undefined {
  const filePath = path.join(MAHALLELER_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  return readJson<Mahalle>(filePath);
}

export function getMahalleBoundary(mahalle: Mahalle): GeoJSON.Feature | undefined {
  if (!mahalle.sinirGeoJSON) return undefined;
  const filePath = path.join(CONTENT_DIR, mahalle.sinirGeoJSON);
  if (!fs.existsSync(filePath)) return undefined;
  return readJson<GeoJSON.Feature>(filePath);
}

export interface NearbyMahalle {
  mahalle: Mahalle;
  uzaklikKm: number;
}

export function getNearbyMahalleler(mahalle: Mahalle, limit = 4): NearbyMahalle[] {
  return getAllMahalleler()
    .filter((other) => other.slug !== mahalle.slug)
    .map((other) => ({
      mahalle: other,
      uzaklikKm: haversineDistanceKm(mahalle.merkezKoordinat, other.merkezKoordinat),
    }))
    .sort((a, b) => a.uzaklikKm - b.uzaklikKm)
    .slice(0, limit);
}

export function getSitelerByMahalle(mahalleSlug: string): Site[] {
  const dir = path.join(SITELER_DIR, mahalleSlug);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".json"));
  return files
    .map((file) => readJson<Site>(path.join(dir, file)))
    .sort((a, b) => a.isim.localeCompare(b.isim, "tr"));
}

export function getSiteBySlug(mahalleSlug: string, slug: string): Site | undefined {
  const filePath = path.join(SITELER_DIR, mahalleSlug, `${slug}.json`);
  if (!fs.existsSync(filePath)) return undefined;
  return readJson<Site>(filePath);
}

export function getSiteBoundary(site: Site): GeoJSON.Feature | undefined {
  if (!site.sinirGeoJSON) return undefined;
  const filePath = path.join(CONTENT_DIR, site.sinirGeoJSON);
  if (!fs.existsSync(filePath)) return undefined;
  return readJson<GeoJSON.Feature>(filePath);
}

export function getAllAdalar(mahalleSlug: string): AdaEntry[] {
  const siteler = getSitelerByMahalle(mahalleSlug);
  const adalar: AdaEntry[] = [];
  for (const site of siteler) {
    if (!site.adalar) continue;
    for (const ada of site.adalar) {
      adalar.push({ ...ada, site });
    }
  }
  return adalar.sort((a, b) => a.no.localeCompare(b.no));
}

export function getAdaByNo(mahalleSlug: string, adaNo: string): AdaEntry | undefined {
  return getAllAdalar(mahalleSlug).find((ada) => ada.no === adaNo);
}

export interface EtapEntry {
  no: string;
  adalar: AdaEntry[];
  siteler: Site[];
}

export function getAllEtaplar(mahalleSlug: string): EtapEntry[] {
  const adalar = getAllAdalar(mahalleSlug);
  const etapMap = new Map<string, { adalar: AdaEntry[]; siteMap: Map<string, Site> }>();

  for (const ada of adalar) {
    if (!ada.etap) continue;
    if (!etapMap.has(ada.etap)) {
      etapMap.set(ada.etap, { adalar: [], siteMap: new Map() });
    }
    const entry = etapMap.get(ada.etap)!;
    entry.adalar.push(ada);
    entry.siteMap.set(ada.site.slug, ada.site);
  }

  return Array.from(etapMap.entries())
    .map(([no, { adalar: etapAdalar, siteMap }]) => ({
      no,
      adalar: etapAdalar,
      siteler: Array.from(siteMap.values()).sort((a, b) => a.isim.localeCompare(b.isim, "tr")),
    }))
    .sort((a, b) => Number(a.no) - Number(b.no));
}

export function getEtapByNo(mahalleSlug: string, etapNo: string): EtapEntry | undefined {
  return getAllEtaplar(mahalleSlug).find((etap) => etap.no === etapNo);
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".mdx"));
  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return { ...(data as BlogPost), slug, content };
    })
    .sort((a, b) => (a.tarih < b.tarih ? 1 : -1));
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { ...(data as BlogPost), slug, content };
}

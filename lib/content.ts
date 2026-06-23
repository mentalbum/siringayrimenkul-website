import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { AdaBilgi, BlogPost, Mahalle, Site } from "@/lib/types";

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

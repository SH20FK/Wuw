/**
 * Клиентский кэш Last.fm.
 *
 * Зачем: страница /music при каждом заходе заново тянет одни и те же топы, а
 * хук now-playing опрашивает историю раз в 10 секунд. Без кэша переход
 * «главная → музыка» каждый раз ждёт сеть и обогащение обложек.
 *
 * Правила:
 *  - одинаковые параллельные запросы склеиваются (in-flight dedupe);
 *  - у «сейчас играет» короткий TTL, у топов — длинный;
 *  - `force: true` игнорирует кэш (нужно, когда трек сменился).
 */

const TTL_RECENT_NOW = 8_000;
const TTL_RECENT_LIST = 20_000;
const TTL_CHARTS = 5 * 60_000;

type Entry = { at: number; data: any };

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<any>>();

function ttlFor(query: string) {
  if (query.includes('getrecenttracks')) {
    return /limit=1(&|$)/.test(query) ? TTL_RECENT_NOW : TTL_RECENT_LIST;
  }
  if (query.includes('gettop') || query.includes('getweekly')) return TTL_CHARTS;
  return 30 * 60_000;
}

export function readLastfmCache(query: string) {
  const entry = cache.get(query);
  if (!entry) return null;
  if (Date.now() - entry.at > ttlFor(query)) {
    cache.delete(query);
    return null;
  }
  return entry.data;
}

export function seedLastfmCache(query: string, data: any) {
  cache.set(query, { at: Date.now(), data });
}

export async function lastfm<T = any>(query: string, options: { force?: boolean } = {}): Promise<T | null> {
  if (!options.force) {
    const hit = readLastfmCache(query);
    if (hit) return hit as T;

    const pending = inflight.get(query);
    if (pending) return pending as Promise<T>;
  }

  const request: Promise<T | null> = fetch(`/api/lastfm?${query}`)
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data && !data.error) seedLastfmCache(query, data);
      return data as T | null;
    })
    .catch(() => null)
    .finally(() => {
      if (inflight.get(query) === request) inflight.delete(query);
    });

  inflight.set(query, request);
  return request;
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundsService {
  private cacheKey: string;
  private static TRACKLIST_URL =
    'https://us-central1-als-workshop.cloudfunctions.net/getTracklist';
  // 'http://localhost:8080';
  constructor() {
    this.cacheKey = 'trackUrls';
  }

  getRecents() {
    const numItems = localStorage.length;
    const items: { data: any; time: string }[] = [];
    for (let i = 0; i < numItems; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.cacheKey)) {
        items.push(JSON.parse(localStorage.getItem(key) as any));
      }
    }
    items.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    return items
      .map((a) => ({
        label: `${a.data?.programme.container.title} - ${a.data?.programme.release.label}`,
        data: a.data,
      }))
      .slice(0, 5);
  }

  async getTracklist(url: string) {
    const cacheHit = localStorage.getItem(`${this.cacheKey}:${url}`);
    if (cacheHit) {
      const data = JSON.parse(cacheHit);
      localStorage.setItem(
        `${this.cacheKey}:${url}`,
        JSON.stringify({ data: data.data, time: new Date().toISOString() })
      );
      return data.data;
    }
    const urlObj = new URL(SoundsService.TRACKLIST_URL);
    urlObj.searchParams.set('url', url);
    const resp = await fetch(urlObj.toString());
    if (resp.status === 200) {
      const data = await resp.json();
      localStorage.setItem(
        `${this.cacheKey}:${url}`,
        JSON.stringify({ data, time: new Date().toISOString() })
      );
      return data;
    } else {
      throw new Error(`Could not load programme data [${resp.status}]`);
    }
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  get<T = any>(key: string): T | null {
    const raw = localStorage.getItem(key);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  set(key: string, value: any): boolean {
    localStorage.setItem(key, JSON.stringify(value));

    return true;
  }

  has(key: string): boolean {
    return !!localStorage.getItem(key);
  }

  remove(key: string) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }
}

export class MemoryStorageService {
  private store: Record<string, string> = {};

  get(key: string) {
    return JSON.parse(this.store[key] || '{}') || {};
  }

  set(key: string, value: any): boolean {
    this.store[key] = JSON.stringify(value);
    return true;
  }

  has(key: string): boolean {
    return !!this.store[key];
  }

  remove(key: string) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

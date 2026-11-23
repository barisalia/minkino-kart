/**
 * Etkin ElevenLabs hesabının ses kimliği (18 Kasım 2026). Anahtar takım arkadaşının workspace'ine geçti; orada eski
 * seslerin kayıtlarından kurulan kopyalar başka kimlikle duruyor. Eşleme content/elevenlabs-hesap.json'dadır.
 * Yalnız istek anında çevrilir: manifestlerdeki ve içerik dosyalarındaki kimlik aynı kalır (eski kayıtlar yeniden üretilmez).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DOSYA = path.join(path.dirname(fileURLToPath(import.meta.url)), '../content/elevenlabs-hesap.json');
let esleme: Record<string, string> = {};
try { esleme = JSON.parse(fs.readFileSync(DOSYA, 'utf8').replace(/^﻿/, '')).esleme ?? {}; } catch { esleme = {}; }

export const hesapSesi = (id: string): string => esleme[id] ?? id;

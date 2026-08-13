import { Injectable } from '@angular/core';
import { dump } from 'js-yaml';
import { md5 } from '@noble/hashes/legacy.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { HashAlgorithm, JsonAction, OperationResult } from '../models/tool.model';

@Injectable({ providedIn: 'root' })
export class DevToolsService {
  processJson(source: string, action: JsonAction): OperationResult {
    if (!source.trim()) {
      throw new Error('Cole um JSON antes de executar.');
    }

    const parsed: unknown = JSON.parse(source);
    const value = action === 'yaml'
      ? dump(parsed, { indent: 2, noRefs: true, lineWidth: 100 })
      : JSON.stringify(parsed, null, action === 'format' ? 2 : 0);

    const messages: Record<JsonAction, string> = {
      format: 'JSON válido · formatado com 2 espaços',
      minify: 'JSON válido · conteúdo minificado',
      yaml: 'JSON válido · convertido para YAML'
    };

    return { value, message: messages[action] };
  }

  generateUuids(count: number): string {
    const safeCount = Math.max(1, Math.min(100, Math.trunc(count || 1)));
    return Array.from({ length: safeCount }, () => crypto.randomUUID()).join('\n');
  }

  encodeBase64(value: string): string {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  decodeBase64(value: string): string {
    const normalized = value.replace(/\s/g, '');
    if (!normalized) return '';
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  }

  hash(value: string, algorithm: HashAlgorithm): string {
    if (!value) return '';
    const bytes = new TextEncoder().encode(value);
    return bytesToHex(algorithm === 'md5' ? md5(bytes) : sha256(bytes));
  }
}

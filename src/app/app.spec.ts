import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MessageService } from 'primeng/api';
import { App } from './app';
import { DevToolsService } from './core/services/dev-tools.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [MessageService, provideAnimationsAsync(), provideZonelessChangeDetection()]
    }).compileComponents();
  });

  it('creates the application', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('formats valid JSON', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.jsonInput.set('{"ok":true}');
    app.processJson('format');
    expect(app.jsonOutput()).toContain('  "ok": true');
    expect(app.jsonStatusTone()).toBe('success');
  });

  it('generates known hash values', () => {
    const service = TestBed.inject(DevToolsService);
    expect(service.hash('abc', 'md5')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(service.hash('abc', 'sha256')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('converts JSON to YAML and handles Unicode Base64', () => {
    const service = TestBed.inject(DevToolsService);
    expect(service.processJson('{"nome":"DevKit"}', 'yaml').value).toContain('nome: DevKit');
    const encoded = service.encodeBase64('Olá, mundo!');
    expect(encoded).toBe('T2zDoSwgbXVuZG8h');
    expect(service.decodeBase64(encoded)).toBe('Olá, mundo!');
  });
});

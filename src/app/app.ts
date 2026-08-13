import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DevToolsService } from './core/services/dev-tools.service';
import { HashAlgorithm, JsonAction, ToolId, ValidationTone } from './core/models/tool.model';
import { TOOL_NAVIGATION } from './shared/data/tool-navigation.data';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    DecimalPipe,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    SelectButtonModule,
    TextareaModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly devTools = inject(DevToolsService);
  private readonly messages = inject(MessageService);

  readonly tools = TOOL_NAVIGATION;
  readonly activeTool = signal<ToolId>('json');
  readonly currentTool = computed(() => this.tools.find((tool) => tool.id === this.activeTool())!);

  readonly jsonInput = signal('');
  readonly jsonOutput = signal('');
  readonly jsonStatus = signal('Pronto para validar');
  readonly jsonStatusTone = signal<ValidationTone>('info');
  readonly inputBytes = computed(() => new TextEncoder().encode(this.jsonInput()).byteLength);

  readonly uuidCount = signal(5);
  readonly uuidOutput = signal('');

  readonly base64Input = signal('');
  readonly base64Output = signal('');
  readonly base64Status = signal('Suporta texto Unicode e caracteres acentuados.');

  readonly hashInput = signal('');
  readonly hashAlgorithm = signal<HashAlgorithm>('md5');
  readonly hashOptions = [
    { label: 'MD5', value: 'md5' },
    { label: 'SHA-256', value: 'sha256' }
  ];
  readonly hashOutput = computed(() => this.devTools.hash(this.hashInput(), this.hashAlgorithm()));

  constructor() {
    this.generateUuids();
  }

  selectTool(tool: ToolId): void {
    this.activeTool.set(tool);
  }

  updateJsonInput(value: string): void {
    this.jsonInput.set(value);
    this.jsonStatus.set('Alterações ainda não validadas');
    this.jsonStatusTone.set('info');
  }

  processJson(action: JsonAction): void {
    try {
      const result = this.devTools.processJson(this.jsonInput(), action);
      this.jsonOutput.set(result.value);
      this.jsonStatus.set(result.message);
      this.jsonStatusTone.set('success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível processar o JSON.';
      this.jsonOutput.set('');
      this.jsonStatus.set(`Erro: ${message}`);
      this.jsonStatusTone.set('error');
    }
  }

  clearJson(): void {
    this.jsonInput.set('');
    this.jsonOutput.set('');
    this.jsonStatus.set('Pronto para validar');
    this.jsonStatusTone.set('info');
  }

  updateUuidCount(value: number | null): void {
    this.uuidCount.set(value ?? 1);
  }

  generateUuids(): void {
    this.uuidOutput.set(this.devTools.generateUuids(this.uuidCount()));
  }

  encodeBase64(): void {
    this.base64Output.set(this.devTools.encodeBase64(this.base64Input()));
    this.base64Status.set('Texto codificado com sucesso.');
  }

  decodeBase64(): void {
    try {
      this.base64Output.set(this.devTools.decodeBase64(this.base64Input()));
      this.base64Status.set('Base64 decodificado com sucesso.');
    } catch {
      this.base64Output.set('');
      this.base64Status.set('Base64 inválido. Confira o conteúdo e tente novamente.');
    }
  }

  setHashAlgorithm(value: HashAlgorithm): void {
    this.hashAlgorithm.set(value);
  }

  async copy(value: string): Promise<void> {
    if (!value) {
      this.messages.add({ severity: 'warn', summary: 'Nada para copiar', detail: 'Gere um resultado primeiro.' });
      return;
    }

    await navigator.clipboard.writeText(value);
    this.messages.add({ severity: 'success', summary: 'Copiado', detail: 'Resultado enviado para a área de transferência.' });
  }

  handleShortcut(event: KeyboardEvent): void {
    if (!(event.metaKey || event.ctrlKey) || event.key !== 'Enter') return;
    event.preventDefault();

    const actions: Record<ToolId, () => void> = {
      json: () => this.processJson('format'),
      uuid: () => this.generateUuids(),
      base64: () => this.encodeBase64(),
      hash: () => this.copy(this.hashOutput())
    };
    actions[this.activeTool()]();
  }
}

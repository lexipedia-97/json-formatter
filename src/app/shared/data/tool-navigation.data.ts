import { ToolNavigationItem } from '../../core/models/tool.model';

export const TOOL_NAVIGATION: readonly ToolNavigationItem[] = [
  {
    id: 'json',
    label: 'JSON / YAML',
    shortLabel: 'JSON',
    description: 'Valide, formate, minifique e converta para YAML.',
    icon: 'pi pi-code'
  },
  {
    id: 'uuid',
    label: 'Gerador de UUID',
    shortLabel: 'UUID',
    description: 'Gere identificadores UUID v4 com segurança.',
    icon: 'pi pi-sparkles'
  },
  {
    id: 'base64',
    label: 'Base64',
    shortLabel: 'Base64',
    description: 'Codifique e decodifique texto com suporte a Unicode.',
    icon: 'pi pi-arrow-right-arrow-left'
  },
  {
    id: 'hash',
    label: 'Gerador de Hash',
    shortLabel: 'Hash',
    description: 'Calcule hashes MD5 e SHA-256 instantaneamente.',
    icon: 'pi pi-hashtag'
  }
];

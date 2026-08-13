export type ToolId = 'json' | 'uuid' | 'base64' | 'hash';
export type JsonAction = 'format' | 'minify' | 'yaml';
export type HashAlgorithm = 'md5' | 'sha256';
export type ValidationTone = 'info' | 'success' | 'error';

export interface ToolNavigationItem {
  id: ToolId;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}

export interface OperationResult {
  value: string;
  message: string;
}

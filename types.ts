export enum AppStep {
  UPLOAD = 1,
  ANALYSIS = 2,
  GENERATION = 3,
  RESULT = 4,
}

export interface GenerationConfig {
  image: string; // Base64
  action: string;
  customPrompt?: string;
}

export interface GeneratedResult {
  imageUrl: string;
  promptUsed: string;
}

export interface ActionConfig {
  id: string;
  label: string;
  subLabel: string;
  icon: string;
  /**
   * Optional override for the action type sent to the model.
   * Falls back to the action id when not provided.
   */
  generationAction?: string;
  /**
   * Optional custom prompt used when generationAction is 'custom'.
   */
  customPrompt?: string;
}

export interface SpriteResult extends GeneratedResult {
  actionId: string;
  actionLabel: string;
  activeFrames: boolean[];
  generatedAt: number;
}
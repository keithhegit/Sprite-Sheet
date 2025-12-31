import { ActionConfig } from './types';

export const CUSTOM_ACTION_ID = 'custom';

export const ACTION_OPTIONS: ActionConfig[] = [
  { id: 'run', label: '奔跑', subLabel: '奔跑循环', icon: 'Rabbit' },
  { id: 'walk', label: '行走', subLabel: '行走循环', icon: 'Footprints' },
  { id: 'idle', label: '待机', subLabel: '呼吸待机', icon: 'Hourglass' },
  { id: 'attack', label: '攻击', subLabel: '攻击动作', icon: 'Swords' },
  {
    id: 'hit',
    label: '被攻击',
    subLabel: '受击反应',
    icon: 'Shield',
    generationAction: 'custom',
    customPrompt: 'taking damage / hit reaction. Character recoils after being struck, slight knockback, spark impact. Maintain facing right.',
  },
  { id: 'jump', label: '跳跃', subLabel: '跳跃动作', icon: 'ArrowUp' },
  { id: 'die', label: '倒地', subLabel: '倒地动作', icon: 'Skull' },
  {
    id: CUSTOM_ACTION_ID,
    label: '自定义',
    subLabel: '描述任意动作',
    icon: 'Sparkles',
    generationAction: 'custom',
  },
];

export const ACTION_PRESETS = [
  {
    id: 'battle',
    label: '战斗四件套',
    actions: ['attack', 'hit', 'idle', 'die'],
  },
  {
    id: 'movement',
    label: '移动三件套',
    actions: ['run', 'walk', 'idle'],
  },
  {
    id: 'all',
    label: '全选',
    actions: ACTION_OPTIONS.filter((option) => option.id !== CUSTOM_ACTION_ID).map((option) => option.id),
  },
];

export const STEPS = [
  { id: 1, label: '上传' },
  { id: 2, label: '分析' },
  { id: 3, label: '生成' },
  { id: 4, label: '结果' },
];
import { ActionTemplate } from '../models/action.model';

export const ActionTemplates: ActionTemplate[] = [
  {
    id: 0,
    action: {
      comment: 'QLab Go Command',
      type: 'osc-output',
      params: {
        host: '127.0.0.1',
        port: 53000,
        address: '/go',
        args: [],
        protocol: 'udp',
      },
      enabled: true,
    },
    tags: 'qlab figure 53 osc go',
  },
  {
    id: 1,
    action: {
      comment: 'QLab playhead next',
      type: 'osc-output',
      params: {
        host: '127.0.0.1',
        port: 53000,
        address: '/playhead/next',
        args: [],
        protocol: 'udp',
      },
      enabled: true,
    },
    tags: 'qlab figure 53 osc playhead next',
  },
];

import { TemplateObject } from '../models/template.model';

export const TemplateObjects: TemplateObject[] = [
  {
    type: 'Action',
    object: {
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
    type: 'Action',
    object: {
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
  {
    type: 'Trigger',
    object: {
      comment: 'convert http to osc',
      type: 'regex',
      params: {
        patterns: ['.*'],
        properties: ['originalUrl'],
      },
      actions: [
        {
          type: 'osc-output',
          params: {
            host: '127.0.0.1',
            port: 9999,
            protocol: 'udp',
            _address: '${msg.originalUrl}',
            args: [],
          },
          enabled: true,
        },
      ],
      enabled: true,
    },
    tags: 'http osc translation',
  },
];

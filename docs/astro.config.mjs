import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'showbridge',
      favicon: '/favicon.ico',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/jwetzell/showbridge',
        },
      ],
      sidebar: [
        {
          label: 'showbridge',
          autogenerate: { directory: '/showbridge' },
        },
        {
          label: 'Run',
          autogenerate: { directory: 'run' },
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
        { label: 'Demo', link: 'https://demo.showbridge.io/', attrs: { target: '_blank' } },
        {
          label: 'More Docs',
          items: [
            {
              label: 'Config JSON Schema',
              link: 'https://docs.showbridge.io/schema/config',
              attrs: { target: '_blank' },
            },
          ],
        },
      ],
    }),
  ],
});

import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'showbridge',
      favicon: '/favicon.ico',
      social: {
        github: 'https://github.com/jwetzell/showbridge',
      },
      sidebar: [
        {
          label: 'showbridge',
          autogenerate: { directory: '/showbridge' },
        },
        {
          label: 'Guides',
          autogenerate: { directory: 'guides' },
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
        { label: 'Demo', link: 'https://demo.showbridge.io/', attrs: { target: '_blank' } },
        {
          label: 'More Docs',
          items: [
            { label: 'Lib JSDocs', link: 'https://docs.showbridge.io/lib/', attrs: { target: '_blank' } },
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

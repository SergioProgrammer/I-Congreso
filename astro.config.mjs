import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import compress from 'astro-compress';
import icon from 'astro-icon';
import react from '@astrojs/react';
import vercel from "@astrojs/vercel/serverless"; 


// https://astro.build/config
export default defineConfig({
  site: 'https://congresocatavs.org',
  output: "server",   
  adapter: vercel(),
  integrations: [
    mdx(),
    icon(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    compress(),
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          logger: {
            warn: () => {},
          },
        },
      },
    },
  },
});

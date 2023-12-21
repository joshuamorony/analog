/// <reference types="vitest" />

import analog from '@analogjs/platform';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    publicDir: 'src/assets',
    optimizeDeps: {
      include: ['@angular/common'],
    },
    build: {
      target: ['es2020'],
    },
    plugins: [
      {
        name: 'ngx-parser',
        async transform(code, id) {
          if (!id.includes('.md')) {
            return;
          }

          const content = code;
          let transformedContent = content;

          const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
          let scriptContent = '';
          const componentMap = {};

          if (scriptMatch) {
            scriptContent = scriptMatch[1];
            const importRegex =
              /import\s+{\s*([^}]+)\s*}\s+from\s+['"](.+?)['"]/g;
            let importMatch: RegExpExecArray | null;

            while ((importMatch = importRegex.exec(scriptContent)) !== null) {
              const componentName = importMatch[1].trim();
              const componentPath = importMatch[2].trim();
              componentMap[componentName] = componentPath;
            }

            transformedContent = transformedContent.replace(scriptMatch[0], '');
          }

          return {
            code: transformedContent,
            componentMap: JSON.stringify(componentMap),
          };
        },
      },
      analog({
        static: true,
        prerender: {
          routes: async () => {
            return [
              '/',
              '/blog',
              '/about',
              '/api/rss.xml',
              '/blog/2022-12-27-my-first-post',
              '/blog/my-second-post',
            ];
          },
          sitemap: {
            host: 'https://analog-blog.netlify.app',
          },
        },
      }),
    ],
  };
});

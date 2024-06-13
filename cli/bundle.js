import { copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const fileList = [
  {
    src: '../sample/config/default.json',
    dest: './sample/config/default.json',
  },
  {
    src: '../sample/config/dev.json',
    dest: './sample/config/dev.json',
  },
  {
    src: '../sample/vars/default.json',
    dest: './sample/vars/default.json',
  },
  {
    src: '../sample/vars/dev.json',
    dest: './sample/vars/dev.json',
  },
  {
    src: '../schema/config.schema.json',
    dest: './schema/config.schema.json',
  },
];

fileList.forEach((bundledFile) => {
  const src = path.join(import.meta.dirname, bundledFile.src);
  const dest = path.join(import.meta.dirname, bundledFile.dest);
  mkdirSync(path.dirname(dest), {
    recursive: true,
  });
  copyFileSync(src, dest);
});

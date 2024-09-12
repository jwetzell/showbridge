import { existsSync, rmSync, symlinkSync } from 'node:fs';
import path from 'node:path';

const fileList = [
  {
    src: '../sample',
    dest: './sample',
  },
  {
    src: '../schema',
    dest: './schema',
  },
];

fileList.forEach((bundledFile) => {
  const src = path.join(import.meta.dirname, bundledFile.src);
  const dest = path.join(import.meta.dirname, bundledFile.dest);
  if (existsSync(dest)) {
    rmSync(dest, {
      force: true,
      recursive: true,
    });
  }
  symlinkSync(src, dest);
});

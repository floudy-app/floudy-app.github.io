import { copyFileSync, existsSync } from 'fs';

copyFileSync('dist/index.html', 'dist/404.html');

if (existsSync('public/resources/favicon.png'))
{
  copyFileSync('public/resources/favicon.png', 'dist/favicon.png');
}

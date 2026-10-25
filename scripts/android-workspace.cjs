const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

function prepareAndroidWorkspace(source) {
  const id = createHash('sha256').update(source).digest('hex').slice(0, 12);
  const target = path.join(process.env.SystemDrive || 'C:', 'FalaBuild', id);
  if (/[^\x00-\x7F]/.test(target)) throw new Error('Use uma pasta de projeto sem acentos para compilar no Windows.');
  const marker = path.join(target, '.fala-build-source');
  if (fs.existsSync(target) && (!fs.existsSync(marker) || fs.readFileSync(marker, 'utf8') !== source)) {
    throw new Error('A pasta de compilação já existe e não pertence a este projeto.');
  }
  fs.mkdirSync(target, { recursive: true });
  fs.writeFileSync(marker, source);
  let copied = 0;
  function sync(from, to) {
      const relative = path.relative(source, from).replaceAll('\\', '/');
      const first = relative.split('/')[0];
      if (['.git', '.expo', '.claude', '.codex', '.agents', '.aws', '.planning', 'android', 'ios', 'dist', 'store'].includes(first)) return;
      if (/^\.env/.test(first) || first === 'google-service-account.json' || /\.(apk|aab|log)$/.test(relative)) return;
      if (/(^|\/)\.(gradle|cxx)(\/|$)/.test(relative) || /\/android\/build(\/|$)/.test(relative)) return;
      const stat = fs.statSync(from);
      if (stat.isDirectory()) {
        fs.mkdirSync(to, { recursive: true });
        for (const name of fs.readdirSync(from)) sync(path.join(from, name), path.join(to, name));
        return;
      }
      if (fs.existsSync(to)) {
        const previous = fs.statSync(to);
        if (previous.size === stat.size && Math.abs(previous.mtimeMs - stat.mtimeMs) < 1) return;
      }
      // Avoid cpSync's native overwrite path, which also corrupts Unicode sources.
      fs.copyFileSync(from, to);
      fs.utimesSync(to, stat.atime, stat.mtime);
      copied += 1;
  }
  sync(source, target);
  console.log(`Android: pasta de compilação ${target} (${copied} arquivos sincronizados).`);
  return target;
}

module.exports = { prepareAndroidWorkspace };

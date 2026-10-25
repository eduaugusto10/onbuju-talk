const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

if (process.platform === 'win32' && !process.env.JAVA_HOME) {
  for (const toolchain of [path.join(process.env.LOCALAPPDATA || '', 'FalaMobile', 'toolchain'), path.join(process.cwd(), '.expo', 'toolchain')]) {
    if (!fs.existsSync(toolchain)) continue;
    const java = fs.readdirSync(toolchain).find(name => name.startsWith('jdk-17') && fs.existsSync(path.join(toolchain, name, 'bin', 'java.exe')));
    if (java) { process.env.JAVA_HOME = path.join(toolchain, java); break; }
  }
}

// Native Windows tools cannot reliably compile paths with accents. Keep a
// separate build workspace; the original source and Git repository stay intact.
if (process.platform === 'win32' && process.argv[2] === 'run:android' && /[^\x00-\x7F]/.test(process.cwd())) {
  const target = require('./android-workspace.cjs').prepareAndroidWorkspace(process.cwd());
  const launcher = path.join(target, 'scripts', 'expo-android.cjs');
  const prepare = spawnSync(process.execPath, [launcher, 'prebuild', '--platform', 'android', '--no-install'], {
    cwd: target, stdio: 'inherit', windowsHide: true
  });
  if (prepare.status !== 0) process.exit(prepare.status ?? 1);
  const result = spawnSync(process.execPath, [launcher, ...process.argv.slice(2)], { cwd: target, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

// Node's native recursive cpSync on Windows can corrupt non-ASCII paths.
// A pass-through filter uses its JS traversal, preserving the original paths.
// Scope the workaround to this Expo process; do not modify node_modules.
if (process.platform === 'win32') {
  process.env.JAVA_TOOL_OPTIONS = `${process.env.JAVA_TOOL_OPTIONS || ''} -Dfile.encoding=UTF-8`.trim();
  const copy = fs.cpSync;
  fs.cpSync = function (source, destination, options = {}) {
    const needsUnicodeCopy = /[^\x00-\x7F]/.test(String(source) + String(destination));
    return copy(source, destination, needsUnicodeCopy && !options.filter
      ? { ...options, filter: () => true }
      : options);
  };

  const sdk = path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk');
  if (!process.env.ANDROID_HOME && fs.existsSync(sdk)) process.env.ANDROID_HOME = sdk;
}

const expoCli = require.resolve('expo/bin/cli');
process.argv = [process.execPath, expoCli, ...process.argv.slice(2)];
require(expoCli);

import cp from 'node:child_process';

const eslintProcess = cp.spawnSync('eslint', ['./'], {
  stdio: 'inherit',
});

if (eslintProcess.error) {
  console.error(eslintProcess.error);
}

const lintError = eslintProcess.error || eslintProcess.status > 0;

const prettierProcess = cp.spawnSync('prettier', ['./', '--check'], {
  stdio: 'inherit',
});

if (prettierProcess.error) {
  console.error(prettierProcess.error);
}

const formatError = prettierProcess.error || prettierProcess.status > 0;

if (lintError || formatError) {
  console.error(`Formatting or linting error found.`);
  process.exit(1);
} else {
  console.log('No formatting or linting errors found.');
}

const levelMap = {
  10: '\u001b[90mTRACE\u001b[39m ',
  20: '\u001b[34mDEBUG\u001b[39m ',
  30: '\u001b[32mINFO\u001b[39m ',
  40: '\u001b[33mWARN\u001b[39m ',
  50: '\u001b[31mERROR\u001b[39m ',
  60: '\u001b[41mFATAL\u001b[49m ',
};

const term = new Terminal();
const fitAddon = new FitAddon.FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
fitAddon.fit();

electron.on('log', (event, log) => {
  try {
    const logObj = JSON.parse(log);
    if (logObj.time && logObj.level && logObj.msg) {
      const logDate = new Date(logObj.time);
      const logLine = `[${logDate.format('HH:MM:ss.l')}] ${levelMap[logObj.level]}: \u001b[36m${logObj.msg}\u001b[39m`;
      term.writeln(logLine);
    } else {
      term.writeln(log);
    }
  } catch (error) {
    term.writeln(log);
  }
});

electron.send('logWinLoaded');

window.addEventListener('resize', () => {
  if (fitAddon) {
    fitAddon.fit();
  }
});

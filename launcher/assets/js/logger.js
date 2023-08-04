/* eslint-disable no-undef */

const logsElement = document.getElementById('logs');
const logsWrapperElement = document.getElementById('logs-wrapper');
electron.on('log', (event, log) => {
  const logEntryElement = document.createElement('p');
  logEntryElement.innerText = log;

  logsElement.appendChild(logEntryElement);
  logsWrapperElement.scrollTo(0, logsWrapperElement.scrollHeight);
});

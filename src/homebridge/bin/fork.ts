process.title = 'homebridge-ambient-hue';

setInterval(() => {
  if (!process.connected) {
    process.exit(1);
  }
}, 10000);

process.on('disconnect', () => {
  process.exit();
});

import('../../main');
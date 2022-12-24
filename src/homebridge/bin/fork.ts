process.title = 'homebridge-ambient-hue';

process.on('disconnect', () => {
  process.exit(10);
});

import('../../main');

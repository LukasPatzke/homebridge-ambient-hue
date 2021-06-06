import { ConfigService } from '../modules/config/config.service';
import fs = require('fs');

const configService = new ConfigService();

fs.writeFileSync(
  'ormconfig.json',
  JSON.stringify(configService.getTypeOrmConfig(), null, 2),
);

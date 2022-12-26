import { DataSource } from 'typeorm';
import { ConfigService } from './modules/config/config.service';

const configService = new ConfigService();

export default new DataSource(configService.getTypeOrmConfig());

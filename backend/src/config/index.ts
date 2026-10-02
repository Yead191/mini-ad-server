import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  ip_address: process.env.IP_ADDRESS || '0.0.0.0',
  database_url: process.env.DATABASE_URL,
  node_env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  base_url: process.env.BASE_URL || 'http://localhost:5000',
  project_name: process.env.PROJECT_NAME || 'Mini Ad Server',
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
};

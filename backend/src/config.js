import 'dotenv/config';

export const config = {
  rpcUrl: process.env.RPC_URL || '',
  chainId: Number(process.env.CHAIN_ID || 80002),
  oracleAddress: process.env.ORACLE_ADDRESS || '',
  updaterKey: process.env.UPDATER_PRIVATE_KEY || '',
  port: Number(process.env.PORT || 3801),
  lat: Number(process.env.LAT || 43.4636),
  lng: Number(process.env.LNG || 11.8748),
  radiusKm: Number(process.env.RADIUS_KM || 30),
  dbPath: process.env.DB_PATH || 'data/fuel.db',
};

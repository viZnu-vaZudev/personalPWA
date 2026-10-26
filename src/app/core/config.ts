import { backendConfig } from './backend-config';
// Public browser configuration only. Never add service-role keys here.
export const config = {
  production: false,
  allowDemo: true,
  ...backendConfig,
};

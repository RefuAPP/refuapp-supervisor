import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'online.refuapp.supervisor',
  appName: 'RefuApp Supervisor',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;

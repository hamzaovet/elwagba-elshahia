import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elwagba.elshahia',
  appName: 'الوجبة الشهية',
  webDir: 'public',
  server: {
    url: 'https://elwagba-elshahia.vercel.app',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#FAF7F2',
  },
};

export default config;

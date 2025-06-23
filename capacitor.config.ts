import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spdvirtual.app',
  appName: '二次系统模型管理',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP'
    },
    Keyboard: {
      resizeOnFullScreen: true,
    },
  },
  // android: {
  //   path: '',
  // }
};

export default config;

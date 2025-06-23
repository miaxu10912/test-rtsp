// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // ip: '10.56.58.180',
  // port: '50080',
  // ip: '10.56.58.226',
  ip: '10.56.58.180',
  port: '50080',
  // ip: '10.56.58.156',
  // port: '9101',
  // ip: '10.56.59.148',
  // port: '9105',
  // ip: '10.56.59.227',
  // port: '9300',
  prefix: 'dmc/spd-mgr',
  svgPrefix: 'svg',
  intervalConfigPrefix: 'dmc/ssd-mgr', //间隔配置
  commonPrefix: '', //目前文件预览有使用 kemov
  fileViewPrefix: 'kemov-spdMgr:9104', //安措 预览
  ar5G: 'dmc/spd-pmc',
  ocrPrefix: 'ocr',
  visConfig: {
    complexCircuitType: 'complex', // 全回路配置
  },
  safetyConfig: {
    showRiskWarn: false, // 是否显示风险预警tab
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

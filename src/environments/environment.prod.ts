export const environment = {
  production: true,
  // ip: '10.56.59.148',
  // port: '9105',
  ip: '10.56.58.180',
  // port: '50080',
  port: '50080',
  prefix: 'dmc/spd-mgr',
  intervalConfigPrefix: 'dmc/ssd-mgr', //间隔配置
  svgPrefix: 'svg',
  ar5G: 'dmc/spd-pmc',
  ocrPrefix: 'ocr',
  commonPrefix: '', //目前文件预览有使用 kemov
  fileViewPrefix: 'kemov-spdMgr:9104', //安措 预览
  visConfig: {
    complexCircuitType: 'complex', // 全回路配置
  },
  safetyConfig: {
    showRiskWarn: false, // 是否显示风险预警tab
  },
};

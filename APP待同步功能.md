APP待同步功能

产品设计：https://26vtgn.axshare.com
UI设计：https://lanhuapp.com/web/#/item/project/stage?tid=996c0ab2-82a6-4fbb-a112-aa3c2868372a&pid=16262fea-579d-41c9-9400-33f44d2b0a71

【注意】
  1、APP图形样式与WEB不同，除全回路图样式请参照当前样式(https://i.postimg.cc/F1tWmTR8/20231130202519.jpg)，其他图形样式以UI设计为主；
  2、当前APP需要适配屏幕，如果设置页面宽高时，请使用 ·pxToVw· 方法进行转化；
  3、相关APP启动、打包或插件安装问题，请参考 ·ionic6使用记录.md· 文档；

一、辅助安措

  - 湖南版本（需要更新）【临时版本，应付验收，优先级高】--> 需要单独打包，给夏振兴
  - 广州版本（新增）


二、模型管理（新增）

  子模块：
  - 回路修改（交互需要重新设计）【明年】
  - 模实一致性校核（扫端子排）--端子排图相关功能已完成，剩余空开图、压板图、装置及把手、外部接线图待开发
  - 模型管控（未设计）


三、模型可视化
 
  剩余工作量：
  - 保护配置图（可更新）
  - 图纸卷册（等web端做好，再迁移）【APP需要设计】
  - 全回路（持续性方法同步）
  - 模型成图（持续性同步，点击标记有问题，需要修正） --已修改
  - 小室屏位布置图（柜间连接线绘制优化） --放弃：需要改变原有小室屏位布置图绘制方法，牵涉广
  - 图纸导出功能（导出有问题，需要修正） --已修改
  - 扫标签（光缆芯扫描有问题，需要同步web） --已修改，但需要核对【对接后端：龚博鑫】（web：交互已修改，但后端还未修改接口，如果后续接口有变动，app也需要修改）

四、模型校验（改名称）--> 图纸审核(内部功能暂时不需要更新)


0、设置国外npm地址，删除之前的lib 和build.gradle内容
1、npm uninstall kaimo_rtsp_plugin --force
2、npm install kaimo_rtsp_plugin --force 
3、npm run build
4、npx cap sync android 
5、android studio ，gradle  buildtool ->java设置为17
6、/Users/olaola/Desktop/tmp/ionic6test/testmerge/test-rtsp/node_modules/kaimo_rtsp_plugin/libs/rtsp-native-1.0.aar 拷贝到/Users/olaola/Desktop/tmp/ionic6test/testmerge/test-rtsp/android/app/libs 在app这个目录创建libs，并将
npm_modules的lib拷贝到这个目录（android libs 自动加载目录）
7、this.rtspUrl = `rtsp://${this.rtspSetting.rtspIp}/live/` 改为this.rtspUrl = `rtsp://${this.rtspSetting.rtspIp}/live/camera`
8、修改html为透明,适应自适应渲染
   

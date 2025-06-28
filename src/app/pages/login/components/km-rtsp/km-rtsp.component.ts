import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { registerPlugin } from '@capacitor/core';
import { CommonService } from 'src/app/services/common.service';



interface RtspViewPlugin {
  startPull(options: any): Promise<void>;
  stopPull(): Promise<void>;
  saveJpg(options: { directUrl: string }): Promise<{ success: boolean }>;
  saveMp4(options: { directUrl: string }): Promise<{ success: boolean }>
  stopRecordMp4(): Promise<void>;
}
// 注册插件 - 注意：插件名称必须为 'rtsp_view'
const RtspView = registerPlugin<RtspViewPlugin>('rtsp_view');
enum EmitType {
  select = 1,
  unselect = 2,
}
enum Page {
  camera = 1,
  video,
}
interface CameraEmit {
  photo?: Blob | Blob[];
  video?: Blob;
  type: EmitType;
  fileName?: string;
}

// 测试统计信息接口
interface TestStats {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  startTime: number | null;
  pullSuccess: number;
  pullFailed: number;
  jpgSuccess: number;
  jpgFailed: number;
  mp4StartSuccess: number;
  mp4StartFailed: number;
  mp4StopSuccess: number;
  mp4StopFailed: number;
  stopPullSuccess: number;
  stopPullFailed: number;
}

@Component({
  selector: 'app-km-rtsp',
  templateUrl: './km-rtsp.component.html',
  styleUrls: ['./km-rtsp.component.scss'],
})
export class KmRtspComponent implements OnInit {
  @Output() rtspEmit = new EventEmitter<CameraEmit>();
  @Input() rtspSetting: any = null;
  rtspUrl = 'rtsp://192.168.1.101/live';
  isStreaming = false;
  domInfo = {
    width: 300,
    height: 300,
    x: 0,
    y: 0
  }
  mp4Name: string = '';
  currentPage = 1;
  isStartRecordVideo: boolean = false;
  timer = null;
  showTime = '00:00:00';
  startTime = null;
  baseFilePath = '';

  // 自动测试相关属性
  isTestModeRunning = false;
  currentBigCycle = 0;
  currentSubCycle = 0;
  totalBigCycles = 10;
  totalSubCycles = 10;
  testAborted = false;
  
  // 测试统计信息
  testStats: TestStats = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    startTime: null,
    pullSuccess: 0,
    pullFailed: 0,
    jpgSuccess: 0,
    jpgFailed: 0,
    mp4StartSuccess: 0,
    mp4StartFailed: 0,
    mp4StopSuccess: 0,
    mp4StopFailed: 0,
    stopPullSuccess: 0,
    stopPullFailed: 0
  };

  constructor(private commonSer: CommonService,) {


  }
  async ngOnChanges(changes: SimpleChanges) {
    if (this.rtspSetting) {
      this.rtspUrl = `rtsp://${this.rtspSetting.rtspIp}/live/camera`
    }
  }
  ngOnInit() { }

  // 🎮 对应HTML模板中的按钮方法
  async startPull() {
    await this.startStream();
  }

  async stopPull() {
    await this.stopStream();
  }
  changePage(e: any) {
    if (this.isStartRecordVideo) {
      this.commonSer.showToast('正在录制中');
      return;
    }
    if (this.currentPage == Page.camera) {
      this.currentPage = Page.video;
      return;
    }
    if (this.currentPage == Page.video) {
      this.currentPage = Page.camera;
      return;
    }
  }

  async takeSnapshot() {
    try {
      // 使用当前时间戳作为文件名
      const timestamp = new Date().getTime();
      const url = `${this.baseFilePath}spdVirtual/rtsp_snapshot_${timestamp}.jpg`;
      const result = await RtspView.saveJpg({
        directUrl: url
      });
      if (result.success) {
        this.commonSer.showToast('截图已保存到下载文件夹');
      } else {
        this.commonSer.showToast('截图保存失败');
      }
    } catch (error) {
      console.error('截图失败', error);
      this.commonSer.showToast('截图保存失败');
    }
  };
  async stopStream() {
    try {
      await RtspView.stopPull();
      this.isStreaming = false;
    } catch (error) {
      console.error('停止RTSP流失败', error);

    }
  };
  async startStream() {
    const videoWidth = this.rtspSetting.width || 1920;  // 默认宽度
    const videoHeight = this.rtspSetting.height || 1080; // 默认高度
    const videoFps = this.rtspSetting.fps || 30;      // 默认帧率

    // 等待容器渲染完成
    await this.waitForContainer();

    // 自动获取预览容器的位置信息
    const previewContainer = document.getElementById("rtsp-wrap");
    if (!previewContainer) {
      console.error("错误: 找不到预览容器元素");
      return;
    }

    // 获取容器在页面中的位置
    const containerRect = previewContainer.getBoundingClientRect();

    // 检查容器是否有有效的尺寸
    if (containerRect.width === 0 || containerRect.height === 0) {
      console.warn("容器尺寸为0，等待重新渲染");
      // 等待一下再试
      setTimeout(() => {
        this.startStream();
      }, 500);
      return;
    }

    // 计算滚动偏移量
    const scrollX = window.scrollX || window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

    // 获取设备像素比
    const devicePixelRatio = window.devicePixelRatio || 1;

    // 将CSS像素转换为物理像素，添加滚动偏移量
    const physicalLeft = Math.round((containerRect.left + scrollX) * devicePixelRatio);
    const physicalTop = Math.round((containerRect.top + scrollY) * devicePixelRatio);
    const physicalRight = Math.round((containerRect.right + scrollX) * devicePixelRatio);
    const physicalBottom = Math.round((containerRect.bottom + scrollY) * devicePixelRatio);

    // 添加纠正偏移量 - 根据实际情况调整顶部位置
    const topOffset = -20 * devicePixelRatio; // 向上偏移20像素的物理像素值

    try {
      await RtspView.startPull({
        url: this.rtspUrl,
        width: videoWidth,
        height: videoHeight,
        fps: videoFps,
        renderPosition: {
          left: physicalLeft,
          top: physicalTop + topOffset,
          right: physicalRight,
          bottom: physicalBottom + topOffset
        },
        devicePixelRatio: devicePixelRatio
      });

      this.isStreaming = true;
    } catch (error) {
      console.error('启动RTSP流失败', error);
    }
  }

  // 等待容器元素渲染完成的辅助方法
  private async waitForContainer(): Promise<void> {
    return new Promise((resolve) => {
      const checkContainer = () => {
        const container = document.getElementById("rtsp-wrap");
        if (container) {
          const rect = container.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            resolve();
            return;
          }
        }
        
        // 如果容器还没有准备好，继续等待
        setTimeout(checkContainer, 100);
      };
      
      checkContainer();
    });
  }
  async startSaveMp4() {
    if (this.isStartRecordVideo) {
      return;
    }

    try {
      const timestamp = new Date().getTime();
      this.mp4Name = `rtsp_snapshot_${timestamp}.mp4`;
      const result = await RtspView.saveMp4({
        directUrl: `${this.baseFilePath}spdVirtual/${this.mp4Name}`
      });
      this.startTime = Date.now();
      this.timer && clearInterval(this.timer);
      this.timer = setInterval(() => {
        let currentTime = Date.now();
        let elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
        let hours = Math.floor(elapsedTime / 3600);
        let minutes = Math.floor((elapsedTime % 3600) / 60);
        let seconds = elapsedTime % 60;
        this.showTime =
          this.formatTime(hours) +
          ':' +
          this.formatTime(minutes) +
          ':' +
          this.formatTime(seconds);
      }, 1000);
      this.isStartRecordVideo = true;
    } catch (error) {
      console.error('录制失败', error);
    }
  }
  formatTime(value) {
    return value < 10 ? '0' + value : value;
  }
  async stopRecordMp4() {

    await this.commonSer.presentLoading('视频保存...');
    try {
      const result: any = await RtspView.stopRecordMp4()
      this.commonSer.dismissLoading();
      if (result.success) {
        this.commonSer.showToast('视频已保存到下载文件夹');
        this.isStartRecordVideo = false;
        this.timer && clearInterval(this.timer);
        this.showTime = '00:00:00';


      } else {
        this.commonSer.dismissLoading();
        this.commonSer.showToast('视频保存失败');
      }
    } catch (error) {
      this.commonSer.dismissLoading();
      console.error('失败', error);
    }



  }
  startLoopFrameExtraction() {

  }
  stopLoopFrameExtraction() { }
  ngAfterViewInit() {
    this.startStream();
    const cameraWrap = document.getElementById('rtsp-wrap');
    if (cameraWrap) {
      const width = cameraWrap.clientWidth;  // 内容宽度
      const height = cameraWrap.clientHeight; // 内容高度
      const rect = cameraWrap.getBoundingClientRect();
      this.domInfo = {
        width: width,
        height: height,
        x: rect.x,
        y: rect.y
      }
    }
    const filePath = '/storage/emulated/0/Download' + '/'

    this.baseFilePath = filePath;
  }
  ngOnDestroy() {
    this.isStreaming && this.stopStream()
    this.timer && clearInterval(this.timer)
  }

  // ==================== 自动测试功能 ====================
  
  // 开始自动测试
  async startAutoTest() {
    if (this.isTestModeRunning) {
      this.commonSer.showToast('⚠️ 测试模式已在运行中，请等待完成');
      return;
    }
    
    this.isTestModeRunning = true;
    this.currentBigCycle = 0;
    this.currentSubCycle = 0;
    this.testAborted = false;
    
    // 重置统计信息
    this.testStats = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      startTime: Date.now(),
      pullSuccess: 0,
      pullFailed: 0,
      jpgSuccess: 0,
      jpgFailed: 0,
      mp4StartSuccess: 0,
      mp4StartFailed: 0,
      mp4StopSuccess: 0,
      mp4StopFailed: 0,
      stopPullSuccess: 0,
      stopPullFailed: 0
    };
    
    console.log("🧪 ========== 自动测试开始 ==========");
    console.log("📊 测试计划: 10个大循环 × 10个小循环 = 100次完整测试");
    console.log("🎯 每次测试包含: 拉流→JPG保存→MP4录制→停止录制");
    console.log("⏰ 开始时间:", new Date().toLocaleString());
    console.log("=======================================\n");
    
    this.commonSer.showToast('🧪 自动测试开始，请查看控制台日志');
    
    try {
      await this.runAutoTest();
    } catch (error) {
      console.error('❌ 自动测试出错:', error);
      this.commonSer.showToast('❌ 自动测试出错');
    } finally {
      this.isTestModeRunning = false;
      this.currentBigCycle = 0;
      this.currentSubCycle = 0;
    }
  }

  // 停止自动测试
  async stopAutoTest() {
    this.testAborted = true;
    this.isTestModeRunning = false;
    this.currentBigCycle = 0;
    this.currentSubCycle = 0;
    
    // 确保停止拉流
    if (this.isStreaming) {
      await this.stopStream();
    }
    
    // 确保停止录制
    if (this.isStartRecordVideo) {
      await this.stopRecordMp4();
    }
    
    console.log("❌ 自动测试已手动停止");
    this.commonSer.showToast('❌ 自动测试已停止');
  }

  // 执行自动测试的主要逻辑
  private async runAutoTest() {
    // 大循环：执行10次
    for (let bigCycle = 1; bigCycle <= this.totalBigCycles; bigCycle++) {
      if (this.testAborted) break;
      
      this.currentBigCycle = bigCycle;
      console.log(`\n🔄 ╔════ 大循环 ${bigCycle}/${this.totalBigCycles} 开始 ════╗`);
      
      // 开始拉流
      console.log(`📺 [大循环${bigCycle}] 步骤1: 开始拉流...`);
      const pullStartTime = Date.now();
      
      try {
        await this.startStream();
        const pullDuration = Date.now() - pullStartTime;
        this.testStats.pullSuccess++;
        this.testStats.successfulOperations++;
        console.log(`✅ [大循环${bigCycle}] 拉流成功 (耗时: ${pullDuration}ms)`);
      } catch (error) {
        const pullDuration = Date.now() - pullStartTime;
        this.testStats.pullFailed++;
        this.testStats.failedOperations++;
        console.log(`❌ [大循环${bigCycle}] 拉流失败 (耗时: ${pullDuration}ms, 错误: ${error.message})`);
      }
      this.testStats.totalOperations++;
      
      await this.sleep(2000); // 等待2秒让拉流稳定
      console.log(`⏱️ [大循环${bigCycle}] 拉流稳定等待完成 (2秒)`);
      
      // 小循环：执行10次
      for (let subCycle = 1; subCycle <= this.totalSubCycles; subCycle++) {
        if (this.testAborted) break;
        
        this.currentSubCycle = subCycle;
        console.log(`\n  🔄 ╟─── 大循环${bigCycle} - 小循环 ${subCycle}/${this.totalSubCycles} 开始 ───╢`);
        
        // 等待5秒
        console.log(`  ⏱️ [${bigCycle}-${subCycle}] 步骤1: 等待5秒...`);
        await this.sleep(5000);
        
        // 保存JPG
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        console.log(`  📷 [${bigCycle}-${subCycle}] 步骤2: 保存JPG`);
        
        const jpgStartTime = Date.now();
        try {
          await this.takeSnapshot();
          const jpgDuration = Date.now() - jpgStartTime;
          this.testStats.jpgSuccess++;
          this.testStats.successfulOperations++;
          console.log(`  ✅ [${bigCycle}-${subCycle}] JPG保存成功 (耗时: ${jpgDuration}ms)`);
        } catch (error) {
          const jpgDuration = Date.now() - jpgStartTime;
          this.testStats.jpgFailed++;
          this.testStats.failedOperations++;
          console.log(`  ❌ [${bigCycle}-${subCycle}] JPG保存失败 (耗时: ${jpgDuration}ms, 错误: ${error.message})`);
        }
        this.testStats.totalOperations++;
        
        // 等待5秒
        console.log(`  ⏱️ [${bigCycle}-${subCycle}] 步骤3: 等待5秒...`);
        await this.sleep(5000);
        
        // 开始录制MP4
        console.log(`  🎬 [${bigCycle}-${subCycle}] 步骤4: 开始录制MP4`);
        
        const mp4StartTime = Date.now();
        try {
          await this.startSaveMp4();
          const mp4StartDuration = Date.now() - mp4StartTime;
          this.testStats.mp4StartSuccess++;
          this.testStats.successfulOperations++;
          console.log(`  ✅ [${bigCycle}-${subCycle}] MP4录制开始成功 (耗时: ${mp4StartDuration}ms)`);
        } catch (error) {
          const mp4StartDuration = Date.now() - mp4StartTime;
          this.testStats.mp4StartFailed++;
          this.testStats.failedOperations++;
          console.log(`  ❌ [${bigCycle}-${subCycle}] MP4录制开始失败 (耗时: ${mp4StartDuration}ms, 错误: ${error.message})`);
        }
        this.testStats.totalOperations++;
        
        // 录制2秒
        console.log(`  ⏱️ [${bigCycle}-${subCycle}] 步骤5: 录制2秒...`);
        await this.sleep(2000);
        
        // 停止录制
        console.log(`  ⏹️ [${bigCycle}-${subCycle}] 步骤6: 停止录制`);
        const mp4StopTime = Date.now();
        try {
          await this.stopRecordMp4();
          const mp4StopDuration = Date.now() - mp4StopTime;
          this.testStats.mp4StopSuccess++;
          this.testStats.successfulOperations++;
          console.log(`  ✅ [${bigCycle}-${subCycle}] MP4录制停止成功 (耗时: ${mp4StopDuration}ms)`);
        } catch (error) {
          const mp4StopDuration = Date.now() - mp4StopTime;
          this.testStats.mp4StopFailed++;
          this.testStats.failedOperations++;
          console.log(`  ❌ [${bigCycle}-${subCycle}] MP4录制停止失败 (耗时: ${mp4StopDuration}ms, 错误: ${error.message})`);
        }
        this.testStats.totalOperations++;
        
        // 打印小循环统计
        const successRate = this.getSuccessRate();
        console.log(`  📊 [${bigCycle}-${subCycle}] 小循环完成 - 当前成功率: ${successRate}% (${this.testStats.successfulOperations}/${this.testStats.totalOperations})`);
      }
      
      if (this.testAborted) break;
      
      // 等待2秒
      console.log(`⏱️ [大循环${bigCycle}] 大循环完成，等待2秒...`);
      await this.sleep(2000);
      
      // 停止拉流
      console.log(`📺 [大循环${bigCycle}] 最终步骤: 停止拉流`);
      const stopPullTime = Date.now();
      try {
        await this.stopStream();
        const stopPullDuration = Date.now() - stopPullTime;
        this.testStats.stopPullSuccess++;
        this.testStats.successfulOperations++;
        console.log(`✅ [大循环${bigCycle}] 停止拉流成功 (耗时: ${stopPullDuration}ms)`);
      } catch (error) {
        const stopPullDuration = Date.now() - stopPullTime;
        this.testStats.stopPullFailed++;
        this.testStats.failedOperations++;
        console.log(`❌ [大循环${bigCycle}] 停止拉流失败 (耗时: ${stopPullDuration}ms, 错误: ${error.message})`);
      }
      this.testStats.totalOperations++;
      
      // 等待2秒
      await this.sleep(2000);
      
      // 打印大循环统计
      const currentSuccessRate = this.getSuccessRate();
      const elapsedTime = ((Date.now() - this.testStats.startTime!) / 1000 / 60).toFixed(1);
      console.log(`✅ ╚════ 大循环 ${bigCycle}/${this.totalBigCycles} 完成 ════╝`);
      console.log(`📈 当前统计: 成功率${currentSuccessRate}%, 已用时${elapsedTime}分钟`);
      console.log(`📊 操作统计: 拉流${this.testStats.pullSuccess}/${this.testStats.pullSuccess + this.testStats.pullFailed}, JPG${this.testStats.jpgSuccess}/${this.testStats.jpgSuccess + this.testStats.jpgFailed}, MP4开始${this.testStats.mp4StartSuccess}/${this.testStats.mp4StartSuccess + this.testStats.mp4StartFailed}, MP4停止${this.testStats.mp4StopSuccess}/${this.testStats.mp4StopSuccess + this.testStats.mp4StopFailed}, 停止拉流${this.testStats.stopPullSuccess}/${this.testStats.stopPullSuccess + this.testStats.stopPullFailed}\n`);
    }
    
    // 最终统计报告
    if (!this.testAborted) {
      const totalTime = ((Date.now() - this.testStats.startTime!) / 1000 / 60).toFixed(1);
      const finalSuccessRate = this.getSuccessRate();
      
      console.log("\n🎉 ========== 自动测试完成 ==========");
      console.log("⏰ 结束时间:", new Date().toLocaleString());
      console.log("⏱️ 总耗时:", totalTime + "分钟");
      console.log("📊 总体成功率:", finalSuccessRate + "%");
      console.log("📈 操作统计:");
      console.log(`   • 总操作数: ${this.testStats.totalOperations}`);
      console.log(`   • 成功操作: ${this.testStats.successfulOperations}`);
      console.log(`   • 失败操作: ${this.testStats.failedOperations}`);
      console.log("📋 详细统计:");
      console.log(`   • 开始拉流: ${this.testStats.pullSuccess}成功/${this.testStats.pullFailed}失败`);
      console.log(`   • JPG保存: ${this.testStats.jpgSuccess}成功/${this.testStats.jpgFailed}失败`);
      console.log(`   • MP4开始: ${this.testStats.mp4StartSuccess}成功/${this.testStats.mp4StartFailed}失败`);
      console.log(`   • MP4停止: ${this.testStats.mp4StopSuccess}成功/${this.testStats.mp4StopFailed}失败`);
      console.log(`   • 停止拉流: ${this.testStats.stopPullSuccess}成功/${this.testStats.stopPullFailed}失败`);
      console.log("=====================================");
      
      this.commonSer.showToast(`🎉 自动测试完成！成功率: ${finalSuccessRate}%`);
    }
  }

  // 获取成功率
  getSuccessRate(): string {
    if (this.testStats.totalOperations === 0) return '0.0';
    return ((this.testStats.successfulOperations / this.testStats.totalOperations) * 100).toFixed(1);
  }

  // 等待指定时间的辅助方法
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

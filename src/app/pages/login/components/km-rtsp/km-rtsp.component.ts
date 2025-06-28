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
  constructor(private commonSer: CommonService,) {


  }
  async ngOnChanges(changes: SimpleChanges) {
    if (this.rtspSetting) {
      this.rtspUrl = `rtsp://${this.rtspSetting.rtspIp}/live/camera`
    }
  }
  ngOnInit() { }
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
}

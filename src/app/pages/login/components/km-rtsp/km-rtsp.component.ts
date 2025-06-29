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
    console.log(this.rtspSetting, '+++rtspSettingrtsp')
    if (this.rtspSetting) {
      this.rtspUrl = `rtsp://${this.rtspSetting.rtspIp}/live/camera`
    }
  }
  ngOnInit() { }
  changePage(e: any) {
    console.log(e, '+++changePage')
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
      console.log(result, '===result拍照')
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

    // 自动获取预览容器的位置信息
    const previewContainer = document.getElementById("rtsp-wrap");
    if (!previewContainer) {
      console.log("错误: 找不到预览容器元素");
      return;
    }

    // 获取容器在页面中的位置
    const containerRect = previewContainer.getBoundingClientRect();

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

    console.log(`开始拉流: ${this.rtspUrl}, 分辨率: ${videoWidth}x${videoHeight}, 帧率: ${videoFps}`);
    console.log(`容器位置: left=${containerRect.left}, top=${containerRect.top}, right=${containerRect.right}, bottom=${containerRect.bottom}`);
    console.log(`滚动偏移: scrollX=${scrollX}, scrollY=${scrollY}`);
    console.log(`设备像素比: ${devicePixelRatio}`);
    console.log(`修正后物理渲染区域: (${physicalLeft},${physicalTop + topOffset})-(${physicalRight},${physicalBottom + topOffset})`);

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

      console.log(this.domInfo, '++++this.domInfo')
      this.isStreaming = true;
    } catch (error) {
      console.error('启动RTSP流失败', error);

    }
  };
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
      console.log(result, '++=result')
    } catch (error) {
      console.error('失败', error);
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
    const filePath = '/storage/emulated/0/Download' + '/'
    this.baseFilePath = filePath;
    console.log(filePath, '+++filePath----init')
    
    // 延迟获取容器尺寸和启动流
    setTimeout(() => {
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
        console.log('容器尺寸:', width, 'x', height, '位置:', rect.x, rect.y);
        
        // 确保容器有尺寸后再启动流
        if (width > 0 && height > 0) {
          this.startStream();
        } else {
          console.error('容器尺寸无效:', width, height);
        }
      }
    }, 100);
  }
  ngOnDestroy() {
    this.isStreaming && this.stopStream()
    this.timer && clearInterval(this.timer)
  }
}

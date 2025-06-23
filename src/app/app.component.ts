
import { Component, HostListener, NgZone, Optional } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Toast } from '@capacitor/toast';
import { Network } from '@capacitor/network';
import {
  ActionSheetController,
  IonRouterOutlet,
  ModalController,
  Platform,
} from '@ionic/angular';
import { Keyboard } from '@capacitor/keyboard';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private backBtnPressed = false;
  private keyBoardPressed = false;

  constructor(
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController,
    private androidPermissions: AndroidPermissions,

    @Optional() private routerOutlet?: IonRouterOutlet
  ) { }
  ngOnInit() {
    this.initApp();
  }

  ngOnDestroy() {
    // 删除程序上所有的监听事件
    App.removeAllListeners();
    Network.removeAllListeners();
  }
  // 初始化APP
  initApp() {
    this.platform.ready().then(async () => {
      this.androidPermissions
        .requestPermissions([
          this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE,
          this.androidPermissions.PERMISSION.MANAGE_EXTERNAL_STORAGE,
          this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
          this.androidPermissions.PERMISSION.BLUETOOTH,
          this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN,
          this.androidPermissions.PERMISSION.BLUETOOTH_SCAN,
          this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT,
          this.androidPermissions.PERMISSION.RECORD_AUDIO,
          this.androidPermissions.PERMISSION.CAMERA,
        ])
        .then((res) => {
          console.log('权限我一进来就请求了呀11111', res);
        });
      try {
        // 状态栏
        await StatusBar.show();
        await SplashScreen.hide();
      } catch (err) { }
      // StatusBar.setOverlaysWebView({ overlay: true });
      // await StatusBar.setStyle({ style: Style.Default });
      App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {

      });
      const res = await App.getLaunchUrl();

      try {
        const info = await App.getInfo();

        this.netWorkEvent();
        this.keyBoardEvent();
      } catch (error) { }
    });


  }
  // 重写物理返回键
  @HostListener('document:ionBackButton', ['$event'])
  private overrideHardwareBackAction($event: any) {
    $event.detail.register(100, async () => {
      // hasCloseBackConfirm 表示是否已经关闭过一次确认弹窗
      let hasCloseBackConfirm = false;
      // 关闭键盘
      try {
        if (this.keyBoardPressed) {
          Keyboard.hide();
          this.keyBoardPressed = false;
          return;
        }
      } catch (err) {
        console.log(err, '~~键盘关闭失败');
      }
      // 关闭 ActionSheet
      try {
        const actionSheetEle = await this.actionSheetCtrl.getTop();
        if (actionSheetEle) {
          actionSheetEle.dismiss();
          return;
        }
      } catch (err) {
        console.log(err, '~~ActionSheet关闭失败');
      }


      // 关闭 Modal
      try {
        const modalEle = await this.modalCtrl.getTop();
        if (modalEle) {
          if (modalEle.cssClass == 'back-confirm-modal') {
            // unHandleCallback 这个参数在 onDidDismiss 事件接收, 目的是二次返回只执行 dismiss 不执行 callback
            hasCloseBackConfirm = true;
            modalEle.dismiss({ unHandleCallback: true });
          } else {
            modalEle.dismiss({ isClose: true });
          }

          return;
        }
      } catch (err) {
        console.log(err, '~~Modal关闭失败');
      }



    });
  }
  // 键盘事件
  keyBoardEvent() {
    // 即将隐藏
    Keyboard.addListener('keyboardWillHide', () => {
      setTimeout(() => {
        this.keyBoardPressed = false;
      }, 500);
    });
    // 即将展开
    Keyboard.addListener('keyboardWillShow', () => {
      this.keyBoardPressed = true;
    });
  }
  // 监听当前网络
  netWorkEvent() {
    Network.addListener('networkStatusChange', (status) => {
      if (status.connectionType == 'none') {
        console.log('网络未连接~');
      }
    });
  }


}

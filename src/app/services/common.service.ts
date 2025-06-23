// 系统公共服务
import { Injectable } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  public loading: any = false;
  public loadingInstance: HTMLIonLoadingElement = null;
  loadingFlag: boolean = false;
  timer = null;
  constructor(
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController
  ) { }

  // 提示
  async showToast(
    message: string,
    color?: string,
    duration: number = 2000,
    position?: 'top' | 'bottom' | 'middle'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: position || 'top',
      color: color || 'light',
    });
    await toast.present();
  }

  async showButtonToast(
    message: string,
    color?: string,
    duration: number = 5000,
    position?: 'top' | 'bottom' | 'middle'
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: position || 'top',
      color: color || 'light',
      buttons: [
        {
          text: '关闭',
          role: 'cancel',
          handler: () => { },
        },
      ],
    });
    await toast.present();
  }

  async presentLoading(msg?: string) {
    if (this.loadingInstance) {
      await this.loadingInstance.dismiss();
      this.loadingInstance = null;
    }

    this.loadingInstance = await this.loadingCtrl.create({
      message: msg || '加载中...', // 可以自定义loading的消息
      // duration: 5000, // 设置loading最长显示时间，单位毫秒，超过这个时间自动关闭loading
      showBackdrop: true,
      backdropDismiss: true,
      translucent: true, // 设置loading背景是否透明
      cssClass: 'custom-loading', // 自定义loading的CSS类名，可以在全局样式中定义样式
    });
    await this.loadingInstance.present();

  }
  async dismissLoading() {
    if (this.loadingInstance) {
      await this.loadingInstance.dismiss();
      this.loadingInstance = null;
    }


  }
  // 加载
  async showLoading(msg?: string, duration?: number) {
    const loadingEle = await this.loadingCtrl.getTop();
    if (this.loading || loadingEle) return this.loadingCtrl;
    this.loading = true;
    const loader = await this.loadingCtrl.create({
      message: msg || '加载中',
      translucent: true,
      duration,
      cssClass: 'custom-loading',
      keyboardClose: true, // loading出现时，键盘自动隐藏
    });
    await loader.present();
    return loader;
  }

  // 关闭加载
  async closeLoading(loadingCtrl: any) {
    if (this.loading && loadingCtrl) {
      await loadingCtrl?.then((load) => {
        load?.dismiss();
        this.loading = false;
      });
    }
  }

  // 提示弹窗（两个按钮）
  async showAlert(
    message: string,
    header: string = '提示',
    sureFun?: Function,
    cancelFun?: Function,
    sureText: string = '确定'
  ) {
    const alert = await this.alertCtrl.create({
      cssClass: 'custom-alert-waring',
      header,
      message,
      backdropDismiss: true,
      buttons: [
        {
          text: '取消',
          handler: () => {
            if (cancelFun) cancelFun();
          },
        },
        {
          text: sureText,
          handler: () => {
            if (sureFun) sureFun();
          },
        },
      ],
    });
    await alert.present();
  }

  // 提示弹窗（一个按钮）
  async showOneAlert(
    message: string,
    header: string = '提示',
    sureFun?: Function,
    sureText: string = '确定'
  ) {
    const oneBtnAlert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: false,
      buttons: [
        {
          text: sureText,
          handler: () => {
            if (sureFun) sureFun();
          },
        },
      ],
    });
    await oneBtnAlert.present();
  }

  // 判断字符串是否为空
  isEmpty(obj: any) {
    if (
      typeof obj === 'undefined' ||
      obj === 'undefined' ||
      obj === null ||
      obj === 'Null' ||
      obj === 'null' ||
      obj === '' ||
      JSON.stringify(obj) === '{}'
    ) {
      return true;
    } else {
      return false;
    }
  }

  async closeAll() {
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
    // 关闭 Loading
    try {
      const loadingEle = await this.loadingCtrl.getTop();
      if (loadingEle) {
        loadingEle.dismiss();
        return;
      }
    } catch (err) {
      console.log(err, '~~Loading关闭失败');
    }
    // 关闭 Alert
    try {
      const alertEle = await this.alertCtrl.getTop();
      if (alertEle) {
        alertEle.dismiss();
        return;
      }
    } catch (err) {
      console.log(err, '~~Alert关闭失败');
    }
    // 关闭 Modal
    try {
      const modalEle = await this.modalCtrl.getTop();
      if (modalEle) {
        modalEle.dismiss({ isClose: true });
        return;
      }
    } catch (err) {
      console.log(err, '~~Modal关闭失败');
    }
  }
}

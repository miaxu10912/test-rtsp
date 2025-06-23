import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  rtspSettings = {
    fps: 30,
    rtspIp: '192.168.137.31',
    resolvingPower: '1080p',
    width: 1920,
    height: 1080
  }
  constructor(
    private platform: Platform,
    private navCtrl: NavController,
  ) {
  }
  cameraEmit(ev: any) {
    console.log(ev)
  }
  async ngOnInit() {

  }
  ngAfterViewInit() {

  }
}


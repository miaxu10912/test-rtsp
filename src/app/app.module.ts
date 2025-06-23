import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { File } from '@awesome-cordova-plugins/file/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { CameraPreview } from '@awesome-cordova-plugins/camera-preview/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

import { BarcodeScanner } from '@awesome-cordova-plugins/barcode-scanner/ngx';
import { Zip } from '@awesome-cordova-plugins/zip/ngx';

import { Media, MediaObject } from '@awesome-cordova-plugins/media/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot({ mode: 'ios' }),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    File,
    AndroidPermissions,
    CameraPreview,
    BluetoothSerial,
    Media,
    BarcodeScanner,
    Zip
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

# ionic6 使用记录

> ### 当前环境版本
>
> node 14.16.1
> npm 6.14.12
> @ionic/cli 6.19.1
> @angular/cli 14.0.0

### 一、环境配置

```bash
安装（node10.3+，建议使用最新LTS）
npm install -g cnpm --registry=https://registry.npm.taobao.org
npm install -g @ionic/cli

创建(默认创建angular项目)
ionic start <projectName> blank --type react

启动
ionic serve/npm run start
注意： angular版本 15.0.0要求node最低版本为 v14.20、v16.13或v18.10
```

### 二、打包必要条件（推荐使用 Capacitor）

**1. Capacitor：安装 Android Studio（建议安装最新版）**

1. 首次创建 www 文件夹（编译）
   ionic build
   npx cap init

2. 添加 android 平台
   npx cap add android / ionic capacitor add android

3. 打开 Android Studio （过程比较漫长，耐心等待载入[AS 会在导入 android 项目时自动配置相关插件]，载入完成无异常即可使用 AS 打包）
   npx cap open android / ionic capacitor open android

4. ionic 项目更新内容同步至 android 项目中
   npx cap copy android / ionic cap copy android

   直接打包在安卓运行
   ionic cap run android
   或 ionic cap run android -l --external

debug 模式打包
gradlew assembleDebug
.\gradlew assembleDebug

gradlew assembleInstall

打正式包
signingConfig signingConfigs.debug build.gradle 中添加
.\gradlew assembleRelease

cmd 安装到 pad;
D:\2025\d-p-APP\android\app\build\outputs\apk\debug 目录下
adb install -r -d D:\2025\d-p-APP\android\app\build\outputs\apk\debug\D-POWER 二次模型 APP_debug-v1.0202506131353.apk

5. 可在`package.json`中配置一个`script`(编译、添加 android 平台、打开 AS 并导入 android 项目至 AS)
   {
   "scripts": {
   "android": "ionic build && ionic cap add android && ionic cap open android"
   }
   }

6. 配置应用信息、修改包名、应用图标等，在`capacitor.config.ts`文件中修改

7. 更改应用图标，安装 cordova-res，全局安装`npm install cordova-res -g`

- 如果 cordova-res 安装失败，提示`sharp@xxx:https://github.com/lovell/sharp-libvips/releases/download/v8.11.3/libvips-8.11.3-win32-x64.tar.br`，打开连接下载之后，将文件移动到`E:\nvmSoftware\nvm\v14.16.1\node_cache\_libvips`当前 node 版本下 node_cache_libvips 目录下，再重新安装

- 在项目根目录下新建`resources`目录，添加 icon.png(1024*1024)、splash.png(2732*2732 以上)图片，执行命令`cordova-res android --skip-config --copy`

- 如果报错“找不到 mdpi-foreground.png、找不到 mdpi-background.png”，在`resources/android`目录下，粘贴复制 2 张 icon.png，分别命名为`icon-foreground.png`和`icon-background.png`，最后再次执行命令`cordova-res android --skip-config --copy`，才会将图标拷贝至 capacitor 打包目录中

- `AndroidManifest.xml`中应用图标自适应，有前后图层定义，显示的图标会被放大；如果要等比还原图标，建议图标统一修改为：`android:icon="@mipmap/ic_launcher_foreground`

**2. Cordova：除`Capacitor`需要条件外，额外需要`Jdk`和`Gradle`环境(与老版本 ionic 打包方式相同)**

### 三、插件使用（Capacitor 插件优先）

**1. Capacitor 插件**

1. 相机
   `npm install @capacitor/camera`

- 【注意】

使用时需要添加存储权限**删除 android 重新 add 后，一定要记得添加**
使用相机或者文件选择类插件时，需要配置 `AndroidManifest.xml` 文件(存储权限用于保存/读取照片等文件)

```diff
<?xml version="1.0" encoding="utf-8"?>
<manifest>
  <application></application>
+ <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
+ <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
+ <uses-permission android:name="android.permission.CAMERA" />
</manifest>
```

拍照、相册（可选择多张图片，可切换相册）

- 【异常及解决办法】

  （拍照）不拍照退出会抛出异常：`User cancelled photos app`

  解决：需要对 camera 插件源码进行修改，目前没找到合适的方法，暂时注释了 `node_modules\@capacitor\camera\android\src\main\java\com\capacitorjs\plugins\camera\CameraPlugin.java`中抛出的异常代码

  （相册--多选）未选择退出会抛出异常：`No image picked`

  解决：[可替换插件(@jonz94/capacitor-image-picker)](https: //www.npmjs.com/package/@jonz94/capacitor-image-picker)

2. 文件系统
   `npm install @capacitor/filesystem`

- 【注意】

- 【异常及解决办法】

3. 管理 APP 状态
   `npm install @capacitor/app`

- 【注意】

  （打开其他 APP、退出 APP、获取 APP 信息）

- 【异常及解决办法】

4. 应用启动器
   `npm install @capacitor/app-launcher`

- 【注意】

  知道应用包名，打开应用程序[详见官方示例](https://capacitorjs.com/docs/apis/app-launcher)

- 【异常及解决办法】

5. 开屏动画
   `npm install @capacitor/splash-screen`

- 【注意】

- 【异常及解决办法】

6. 二维码扫描(社区插件)
   `npm install @capacitor-community/barcode-scanner`[无法使用，build 一直失败]

   --当前使用 cordova 插件
   `npm install phonegap-plugin-barcodescanner`

   **注意**
   如果打包构建时遇到错误：**Covld mot find method compile() for arguments [inamebarcodescamner-release-2.1.5,ext-ap on object of type orggradle.api.intemnal.artifact**

   解决办法：将 `node_modules\phonegap-plugin-barcodescanner\src\android\barcodescanner.gradle` 里面关键字 `compile` 改为 `implementation`

- 【注意】

  使用 `@capacitor-community/barcode-scanner`插件需要配置 `AndroidManifest.xml`文件

```diff
<?xml version="1.0" encoding="utf-8"?>
<manifest
  xmlns:android="http://schemas.android.com/apk/res/android"
+ xmlns:tools="http://schemas.android.com/tools"
  package="com.example">
  <application
+ android:hardwareAccelerated="true"
  >
  </application>
+ <uses-permission android:name="android.permission.CAMERA" />
+ <uses-sdk tools:overrideLibrary="com.google.zxing.client.android" />
</manifest>
```

[详见 GitHub 说明](https://github.com/capacitor-community/barcode-scanner)

- 【异常及解决办法】

7. 振动器
   `npm install @capacitor/haptics`

- 【注意】

  与二维码扫描合用

- 【异常及解决办法】

8. 文件打开器（capacitor 社区插件）
   `npm install @capacitor-community/file-opener`

- 【注意】

- 【异常及解决办法】

9. 网络
   `npm install @capacitor/network`

- 【注意】

- 【异常及解决办法】

10. 选择本地媒体文件
    `npm install @capawesome/capacitor-file-picker`
    [相关 api](https://github.com/capawesome-team/capacitor-file-picker)
    支持单独选择本地图片，视频，或其他媒体文件

- 【注意】
- 【异常及解决办法】

**2. Cordova 插件**

[cordova 插件替换为 capacitor](https://capacitorjs.com/docs/cordova/migrating-from-cordova-to-capacitor)

[capacitor 不兼容的 cordova 插件列表](https://capacitorjs.com/docs/plugins/cordova)

**3. 其他插件**

1. 调试工具
   `npm i vconsole -S`

2. svg 绘制插件
   `npm i @svgdotjs/svg.js -S`

3. svg 放大缩小
   `npm i panzoom -S`

4. 缓存
   `npm install @ionic/storage -S`

- [官网提供的数据缓存插件](https://ionicframework.com/docs/react/storage)

### 四、打包及配置

- [capacitor 打包 1](http://flashme.cn/index.php/study/66.html)

- [capacitor 打包 2](https://juejin.cn/post/6844903937544306696)

- package.json 配置(`"android": "npm run build && npx cap sync && npx cap open android"`)

### 五、浏览器中打开 App，App 中调用另一个 App

1. 在 `AndroidManifest.xml` 文件中 `activity` 标签下添加

```xml
<intent-filter>
  <!-- 必须设置 -->
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <!-- scheme 允许在浏览器中打开 -->
  <category android:name="android.intent.category.BROWSABLE" />
   <!-- scheme 协议相关信息配置 也可以配置host：android:host="com.spdvirtual.app" -->
  <data android:scheme="@string/custom_url_scheme" />
</intent-filter>
```

2. 修改 `custom_url_scheme`

> 注意
>
> `custom_url_scheme` 值存储在`res/values/strings.xml`中，添加 `Android` 平台时，`@capacitor/cli` 会添加 app 的包名 作为默认值，但可以通过编辑`strings.xml` 文件来替换

### 六、问题

**1. `NPM`安装超时（因为淘宝镜像换了新域名）**

> 解决办法：
>
> `npm config set registry https://registry.npmmirror.com/`

**2. net:ERR_CLEARTEXT_NOT_PERMITTED**

> 解决办法：
>
> 1. 在`android/app/src/main/res/xml`目录中创建文件`network_security_config.xml`
> 2. 在`AndroidManifest.xml`文件配置

network_security_config.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
      <trust-anchors>
        <certificates src="system"/>
      </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

AndroidManifest.xml

```diff
<?xml version="1.0" encoding="utf-8"?>
<manifest
  xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.example"
  >
  <application
+ android:usesCleartextTraffic="true"
+ android:networkSecurityConfig="@xml/network_security_config"
  >
  </application>

+ <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>
```

**3. 告警'Added non-passive event listener to a scroll-blocking ‘touchstart‘ event.'**

> 解决办法：
>
> 安装 `npm install -S default-passive-events`, 在 main.ts 引入`import 'default-passive-events';`

**4. 打包‘Task :capawesome-capacitor-file-picker:compileDebugJavaWithJavac FAILED Execution failed for task ':capawesome-capacitor-file-picker:compileDebugJavaWithJavac'.’出错**
升级 JDK 为 17

#####语音插件####
1、需要安装的插件根目录下 plugin 下的 KmVoiceRecognitionPlugin，
安装方法：npm i E:\liweiworknew\2023newproject\spd_app2023\plugin(自己电脑的路径)
2、录音插件
npm i cordova-plugin-audioinput
npm i cordova-plugin-media
3、文件解压插件，下载离线包使用
npm i @awesome-cordova-plugins/zip
4、二维码扫描插件
npm i @awesome-cordova-plugins/barcode-scanner
5、主要是权限插件里面的权限请求不支持高版本的设备，
需要将权限插件里面的 plugins，里面的 permissions.java
149 行加如下代码

                permissionsCallback = callbackContext;
                String[] permissionArray = getPermissions(permissions);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
    				for(String permissionStr : permissionArray) {
                        Log.e("km_km", "Request permission SYSTEM_ALERT_WINDO==="+permissionStr);
    					if ("android.permission.MANAGE_EXTERNAL_STORAGE".equals(permissionStr) || "android.permission.WRITE_EXTERNAL_STORAGE".equals(permissionStr)) {
    						Activity activity = this.cordova.getActivity();
                            Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                            intent.setData(Uri.parse("package:" + activity.getPackageName()));
                            activity.startActivity(intent);
                            permissionsCallback = callbackContext;
    					}

    				}
    		    }

##### **复制文本到剪贴板或从剪贴板读取文本**

###### 1，安装插件

```
npm install @capacitor/clipboard
or   yarn add @capacitor/clipboard

npx cap sync
```

2,在需要使用的功能引入组件

```
import { Clipboard } from '@capacitor/clipboard';
```

###### 3，复制

```javascript
  copyTextToClipboard(text: string) {
    Clipboard.write({ string: text })
      .then(() => {
        console.log('Text copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy text to clipboard:', err);
      });
  }
```

###### 4,读取剪切板 数据

```javascript
 readTextFromClipboard() {
    Clipboard.read()
      .then(({ string }) => {
        console.log('Text from clipboard:', string);
      })
      .catch((err) => {
        console.error('Failed to read text from clipboard:', err);
      });
  }
```

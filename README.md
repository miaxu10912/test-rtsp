# Ionic6 + RTSP Plugin 集成指南

基于 Ionic 6 + Capacitor 4.x 的Android RTSP视频流播放应用。

## 环境要求

- Node.js 14+
- Java 17
- Android Studio
- Android SDK API 33

## 快速运行

### 1. 环境配置
```bash
# 设置Java 17 (macOS)
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home
```

### 2. 安装运行
```bash
# 安装依赖
npm install

# 构建项目
ionic build
npx cap sync android

# 构建APK
cd android && ./gradlew assembleDebug

# 安装到设备
cd .. && adb install android/app/build/outputs/apk/debug/*.apk
```

## 关键修复步骤

### 问题1: JNI方法找不到错误
**操作**: 删除主项目中冲突的SO库
```bash
rm -rf android/app/src/main/jniLibs/arm64-v8a/*
```

### 问题2: Capacitor版本冲突  
**操作**: 确保package.json中版本一致
```json
{
  "@capacitor/clipboard": "^4.1.0",
  "@capawesome/capacitor-file-picker": "^0.6.3",
  "kaimo_rtsp_plugin": "^0.0.30"
}
```

### 问题3: AAR依赖配置
**文件**: `node_modules/kaimo_rtsp_plugin/android/build.gradle`
```gradle
repositories {
    flatDir { dirs '../libs' }
}
dependencies {
    implementation(name: 'rtsp-native-1.0', ext: 'aar')
    // implementation project(':android-native')  // 注释掉
}
```

## 注意事项

1. **必须使用Java 17**
2. **删除主项目jniLibs中的SO文件，避免冲突**
3. **使用AAR依赖，不要使用项目依赖**
4. **Capacitor包版本必须统一为4.x**

## 调试命令

```bash
# 查看日志
adb logcat | grep -E "(Capacitor|Console|com.spdvirtual.app)"

# 重新安装
adb uninstall com.spdvirtual.app
adb install [APK路径]
```

## 项目结构

```
test-rtsp/
├── src/                          # Ionic/Angular源码
├── android/                      # Android原生项目
│   ├── app/
│   │   ├── src/main/jniLibs/    # ⚠️ 应保持空白，避免SO库冲突
│   │   └── build.gradle         # Android应用配置
│   └── gradle.properties        # Gradle全局配置
├── node_modules/
│   └── kaimo_rtsp_plugin/       # RTSP插件
│       ├── android/             # 插件Android代码
│       └── libs/                # AAR依赖文件
│           └── rtsp-native-1.0.aar
├── package.json                 # Node.js依赖配置
└── capacitor.config.ts          # Capacitor配置
```

## 许可证

本项目仅供学习和开发使用。

## 更新日志

- **v1.0.0**: 初始版本，集成RTSP插件
- **v1.0.1**: 修复SO库冲突问题
- **v1.0.2**: 优化Java 17兼容性 
package com.spdvirtual.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.SslErrorHandler;
import android.webkit.WebView;


import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

import java.io.File;


public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int MANAGE_STORAGE_REQUEST_CODE = 1002;
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
     // 注册插件
    registerPlugin(com.mycompany.plugins.example.RtspPlugin.class);
    // 检查并请求必要的权限
        checkAndRequestPermissions();
        
        // 创建RTSP视频保存目录
        createRtspVideoDirectory();

    this.bridge.setWebViewClient(new BridgeWebViewClient(this.bridge) {
      @Override
      public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
        handler.proceed();
      }
    });

  }
    private void checkAndRequestPermissions() {
        // 检查并请求存储权限
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // Android 11 (API 30)及以上需要使用MANAGE_EXTERNAL_STORAGE权限
            if (!Environment.isExternalStorageManager()) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                Uri uri = Uri.fromParts("package", getPackageName(), null);
                intent.setData(uri);
                startActivityForResult(intent, MANAGE_STORAGE_REQUEST_CODE);
            }
        } else {
            // Android 10 (API 29)及以下使用READ_EXTERNAL_STORAGE和WRITE_EXTERNAL_STORAGE权限
            String[] permissions = {
                    Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE
            };

            boolean needRequest = false;
            for (String permission : permissions) {
                if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                    needRequest = true;
                    break;
                }
            }

            if (needRequest) {
                ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
            }
        }
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            
            if (allGranted) {
                // 权限授予后，重新创建目录
                createRtspVideoDirectory();
                android.util.Log.i("MainActivity", "存储权限已授予，重新创建目录");
            } else {
                android.util.Log.w("MainActivity", "存储权限被拒绝");
            }
        }
    }
    
    /**
     * 创建RTSP视频保存目录
     */
    private void createRtspVideoDirectory() {
        try {
            // 创建多个可能需要的目录
            File[] directories = {
                new File(Environment.getExternalStorageDirectory(), "rtsp_videos"),
                new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "spdVirtual"),
                new File(getExternalFilesDir(null), "rtsp_videos"),
                new File(getExternalFilesDir(null), "spdVirtual")
            };
            
            for (File dir : directories) {
                if (!dir.exists()) {
                    boolean created = dir.mkdirs();
                    if (created) {
                        android.util.Log.i("MainActivity", "目录创建成功: " + dir.getAbsolutePath());
                    } else {
                        android.util.Log.w("MainActivity", "目录创建失败: " + dir.getAbsolutePath());
                    }
                } else {
                    android.util.Log.i("MainActivity", "目录已存在: " + dir.getAbsolutePath());
                }
            }
            
            // 特别确保Download/spdVirtual目录存在
            File downloadSpdDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), "spdVirtual");
            if (!downloadSpdDir.exists()) {
                boolean success = downloadSpdDir.mkdirs();
                android.util.Log.i("MainActivity", "Download/spdVirtual目录创建" + (success ? "成功" : "失败") + ": " + downloadSpdDir.getAbsolutePath());
            }
            
        } catch (Exception e) {
            android.util.Log.e("MainActivity", "创建目录时发生错误", e);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == MANAGE_STORAGE_REQUEST_CODE) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                if (Environment.isExternalStorageManager()) {
                    // 权限已授予，创建目录
                    createRtspVideoDirectory();
                    android.util.Log.i("MainActivity", "管理所有文件权限已授予，重新创建目录");
                } else {
                    // 权限被拒绝，可以显示提示或者其他处理
                    android.util.Log.e("MainActivity", "管理所有文件权限被拒绝");
                }
            }
        }
    }
}

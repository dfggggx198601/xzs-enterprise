package com.anonymous.xzsapp;

import android.accessibilityservice.AccessibilityService;
import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.LinearLayout;
import android.widget.TextView;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class QuestionAssistantService extends AccessibilityService {

    private WindowManager windowManager;
    private View overlayView;
    private WindowManager.LayoutParams params;
    private TextView tvTitle;
    private TextView tvAnswer;
    private TextView tvSource;
    private TextView tvStatus;

    private String lastScreenText = "";
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final String BASE_URL = "https://exam.440700.xyz";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return;

        StringBuilder sb = new StringBuilder();
        extractText(rootNode, sb);
        rootNode.recycle();

        String currentText = sb.toString().trim();
        if (currentText.length() < 10) return;

        if (!currentText.equals(lastScreenText)) {
            lastScreenText = currentText;
            updateStatus("正在识别匹配...");
            matchQuestion(currentText);
        }
    }

    private void extractText(AccessibilityNodeInfo node, StringBuilder sb) {
        if (node == null) return;
        if (node.getText() != null) {
            String txt = node.getText().toString().trim();
            if (!txt.isEmpty() && txt.length() > 1) {
                sb.append(txt).append("\n");
            }
        }
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            extractText(child, sb);
            if (child != null) {
                child.recycle();
            }
        }
    }

    @Override
    public void onInterrupt() {
        updateStatus("服务已中断");
    }

    @SuppressLint("ClickableViewAccessibility")
    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        windowManager = (WindowManager) getSystemService(Context.WINDOW_SERVICE);

        overlayView = createOverlayLayout();

        int layoutType;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            layoutType = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
        } else {
            layoutType = WindowManager.LayoutParams.TYPE_PHONE;
        }

        params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutType,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
                PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.START;
        params.x = 100;
        params.y = 200;

        try {
            windowManager.addView(overlayView, params);
        } catch (Exception e) {
            // Overlay permission might not be granted yet
        }

        setupDragListener();
    }

    private View createOverlayLayout() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#E61E293B"));
        root.setPadding(30, 20, 30, 20);
        
        float density = getResources().getDisplayMetrics().density;
        root.setMinimumWidth((int) (220 * density));
        
        TextView tvHeader = new TextView(this);
        tvHeader.setText("XZS 刷题助手 (拖动)");
        tvHeader.setTextColor(Color.parseColor("#3B82F6"));
        tvHeader.setTextSize(13);
        tvHeader.setPadding(0, 0, 0, 10);
        tvHeader.setGravity(Gravity.CENTER_HORIZONTAL);
        root.addView(tvHeader);

        View sep = new View(this);
        sep.setBackgroundColor(Color.parseColor("#334155"));
        sep.setMinimumHeight(2);
        root.addView(sep);

        tvTitle = new TextView(this);
        tvTitle.setText("请切换到考试页面...");
        tvTitle.setTextColor(Color.WHITE);
        tvTitle.setTextSize(14);
        tvTitle.setPadding(0, 15, 0, 10);
        root.addView(tvTitle);

        tvAnswer = new TextView(this);
        tvAnswer.setText("等待匹配...");
        tvAnswer.setTextColor(Color.parseColor("#22C55E"));
        tvAnswer.setTextSize(14);
        tvAnswer.setPadding(0, 5, 0, 5);
        root.addView(tvAnswer);

        tvSource = new TextView(this);
        tvSource.setText("");
        tvSource.setTextColor(Color.parseColor("#F59E0B"));
        tvSource.setTextSize(12);
        tvSource.setPadding(0, 5, 0, 5);
        root.addView(tvSource);

        tvStatus = new TextView(this);
        tvStatus.setText("服务正常");
        tvStatus.setTextColor(Color.parseColor("#94A3B8"));
        tvStatus.setTextSize(10);
        tvStatus.setGravity(Gravity.END);
        tvStatus.setPadding(0, 10, 0, 0);
        root.addView(tvStatus);

        return root;
    }

    private void setupDragListener() {
        overlayView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX;
            private int initialY;
            private float initialTouchX;
            private float initialTouchY;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        params.x = initialX + (int) (event.getRawX() - initialTouchX);
                        params.y = initialY + (int) (event.getRawY() - initialTouchY);
                        try {
                            windowManager.updateViewLayout(overlayView, params);
                        } catch (Exception e) {
                            // ignore
                        }
                        return true;
                }
                return false;
            }
        });
    }

    private void updateStatus(final String status) {
        mainHandler.post(() -> tvStatus.setText(status));
    }

    private void matchQuestion(final String text) {
        executorService.execute(() -> {
            HttpURLConnection conn = null;
            try {
                URL url = new URL(BASE_URL + "/api/student/question/match");
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.setDoOutput(true);
                conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");

                String postData = "screenText=" + URLEncoder.encode(text, "UTF-8");
                byte[] postDataBytes = postData.getBytes(StandardCharsets.UTF_8);

                try (OutputStream os = conn.getOutputStream()) {
                    os.write(postDataBytes);
                    os.flush();
                }

                int responseCode = conn.getResponseCode();
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = br.readLine()) != null) {
                        response.append(line);
                    }
                    br.close();

                    JSONObject json = new JSONObject(response.toString());
                    int code = json.optInt("code", 0);
                    if (code == 1) {
                        JSONObject responseData = json.optJSONObject("response");
                        if (responseData != null) {
                            final String title = responseData.optString("title", "未找到题干");
                            final String correct = responseData.optString("correct", "无");
                            final String source = responseData.optString("regulationSource", "");
                            mainHandler.post(() -> {
                                tvTitle.setText("匹配题目: " + title);
                                tvAnswer.setText("答案: " + correct);
                                if (!source.isEmpty() && !"null".equals(source)) {
                                    tvSource.setText("制度来源: " + source);
                                } else {
                                    tvSource.setText("");
                                }
                                tvStatus.setText("匹配成功");
                            });
                        }
                    } else {
                        mainHandler.post(() -> {
                            tvTitle.setText("未在题库中检索到该题目");
                            tvAnswer.setText("等待匹配...");
                            tvSource.setText("");
                            tvStatus.setText("无匹配结果");
                        });
                    }
                } else {
                    updateStatus("请求失败: " + responseCode);
                }
            } catch (Exception e) {
                updateStatus("网络连接异常");
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        });
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (windowManager != null && overlayView != null) {
            try {
                windowManager.removeView(overlayView);
            } catch (Exception e) {
                // ignore
            }
        }
        executorService.shutdown();
    }
}

package com.mindskip.xzs.controller.student;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController("StudentAppVersionController")
@RequestMapping(value = "/api/student/app")
public class AppVersionController extends BaseApiController {

    @Value("${system.app.version:1.0.0}")
    private String latestVersion;

    @Value("${system.app.apk-path:/opt/xzs/app-release.apk}")
    private String apkPath;

    @Value("${system.app.force-update:false}")
    private boolean forceUpdate;

    @RequestMapping(value = "/version", method = RequestMethod.POST)
    public RestResponse<Map<String, Object>> checkVersion() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("version", latestVersion);
        result.put("forceUpdate", forceUpdate);
        result.put("downloadUrl", "/api/student/app/download");
        return RestResponse.ok(result);
    }

    @RequestMapping(value = "/download", method = RequestMethod.GET)
    public ResponseEntity<Resource> download() {
        File file = new File(apkPath);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.android.package-archive"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=xzs-app.apk")
                .contentLength(file.length())
                .body(resource);
    }
}

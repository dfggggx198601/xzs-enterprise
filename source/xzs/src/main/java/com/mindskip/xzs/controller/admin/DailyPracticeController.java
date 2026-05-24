package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.DailyPractice;
import com.mindskip.xzs.domain.DailyPracticeAnswer;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.DailyPracticeAnswerService;
import com.mindskip.xzs.service.DailyPracticeService;
import com.mindskip.xzs.service.UserService;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.PageInfoHelper;
import com.mindskip.xzs.utility.PdfExportUtil;
import com.mindskip.xzs.viewmodel.admin.dailypractice.*;
import com.alibaba.excel.EasyExcel;
import com.itextpdf.text.Document;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@RestController("AdminDailyPracticeController")
@RequestMapping(value = "/api/admin/dailyPractice")
public class DailyPracticeController extends BaseApiController {

    private final DailyPracticeService dailyPracticeService;
    private final DailyPracticeAnswerService dailyPracticeAnswerService;
    private final UserService userService;

    @Autowired
    public DailyPracticeController(DailyPracticeService dailyPracticeService,
                                    DailyPracticeAnswerService dailyPracticeAnswerService,
                                    UserService userService) {
        this.dailyPracticeService = dailyPracticeService;
        this.dailyPracticeAnswerService = dailyPracticeAnswerService;
        this.userService = userService;
    }

    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<DailyPracticePageResponseVM>> pageList(@RequestBody DailyPracticePageRequestVM model) {
        PageInfo<DailyPractice> pageInfo = dailyPracticeService.page(model);
        PageInfo<DailyPracticePageResponseVM> page = PageInfoHelper.copyMap(pageInfo, d -> {
            DailyPracticePageResponseVM vm = modelMapper.map(d, DailyPracticePageResponseVM.class);
            vm.setCreateTime(DateTimeUtil.dateFormat(d.getCreateTime()));
            return vm;
        });
        return RestResponse.ok(page);
    }

    @RequestMapping(value = "/edit", method = RequestMethod.POST)
    public RestResponse edit(@RequestBody @Valid DailyPracticeRequestVM model) {
        DailyPractice dailyPractice = modelMapper.map(model, DailyPractice.class);
        if (model.getId() == null) {
            User user = getCurrentUser();
            dailyPractice.setCreateUser(user.getId());
            dailyPractice.setCreateUserName(user.getUserName());
            dailyPractice.setCreateTime(new Date());
            dailyPractice.setDeleted(false);
            if (dailyPractice.getStatus() == null) {
                dailyPractice.setStatus(1);
            }
        }
        dailyPracticeService.edit(dailyPractice);
        return RestResponse.ok();
    }

    @RequestMapping(value = "/select/{id}", method = RequestMethod.POST)
    public RestResponse<DailyPracticeRequestVM> select(@PathVariable Integer id) {
        DailyPractice dailyPractice = dailyPracticeService.selectById(id);
        DailyPracticeRequestVM vm = modelMapper.map(dailyPractice, DailyPracticeRequestVM.class);
        return RestResponse.ok(vm);
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
    public RestResponse delete(@PathVariable Integer id) {
        DailyPractice dailyPractice = dailyPracticeService.selectById(id);
        dailyPractice.setDeleted(true);
        dailyPracticeService.updateByIdFilter(dailyPractice);
        return RestResponse.ok();
    }

    @RequestMapping(value = "/answer/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<DailyPracticeAnswerPageResponseVM>> answerPageList(@RequestBody DailyPracticeAnswerPageRequestVM model) {
        PageInfo<DailyPracticeAnswer> pageInfo = dailyPracticeAnswerService.pageBest(model);
        PageInfo<DailyPracticeAnswerPageResponseVM> page = PageInfoHelper.copyMap(pageInfo, d -> {
            DailyPracticeAnswerPageResponseVM vm = modelMapper.map(d, DailyPracticeAnswerPageResponseVM.class);
            vm.setCreateTime(DateTimeUtil.dateFormat(d.getCreateTime()));
            if (d.getPracticeDate() != null) {
                vm.setPracticeDate(DateTimeUtil.dateFormat(d.getPracticeDate()));
            }
            User user = userService.selectById(d.getUserId());
            if (user != null) {
                vm.setUserName(user.getUserName());
            }
            DailyPractice dp = dailyPracticeService.selectById(d.getDailyPracticeId());
            if (dp != null) {
                vm.setDailyPracticeTitle(dp.getTitle());
            }
            return vm;
        });
        return RestResponse.ok(page);
    }

    @RequestMapping(value = "/answer/export", method = RequestMethod.GET)
    public void exportAnswers(@RequestParam(required = false) Integer dailyPracticeId,
                              @RequestParam(required = false) Integer gradeLevel,
                              HttpServletResponse response) throws IOException {
        DailyPracticeAnswerPageRequestVM requestVM = new DailyPracticeAnswerPageRequestVM();
        requestVM.setDailyPracticeId(dailyPracticeId);
        requestVM.setGradeLevel(gradeLevel);
        requestVM.setPageIndex(1);
        requestVM.setPageSize(10000);
        PageInfo<DailyPracticeAnswer> pageInfo = dailyPracticeAnswerService.pageBest(requestVM);

        List<DailyPracticeAnswerExportVM> exportList = new ArrayList<>();
        for (DailyPracticeAnswer d : pageInfo.getList()) {
            DailyPracticeAnswerExportVM row = new DailyPracticeAnswerExportVM();
            User user = userService.selectById(d.getUserId());
            if (user != null) {
                row.setUserName(user.getUserName());
                row.setRealName(user.getRealName());
            }
            DailyPractice dp = dailyPracticeService.selectById(d.getDailyPracticeId());
            if (dp != null) {
                row.setDailyPracticeTitle(dp.getTitle());
            }
            row.setScore(d.getScore());
            row.setQuestionCount(d.getQuestionCount());
            row.setQuestionCorrect(d.getQuestionCorrect());
            row.setPracticeDate(d.getPracticeDate() != null ? DateTimeUtil.dateFormat(d.getPracticeDate()) : "");
            row.setCreateTime(DateTimeUtil.dateFormat(d.getCreateTime()));
            exportList.add(row);
        }

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("每日一练完成记录", "UTF-8").replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
        EasyExcel.write(response.getOutputStream(), DailyPracticeAnswerExportVM.class).sheet("完成记录").doWrite(exportList);
    }

    @RequestMapping(value = "/answer/exportPdf", method = RequestMethod.GET)
    public void exportPdf(@RequestParam(required = false) Integer dailyPracticeId,
                          HttpServletResponse response) throws IOException {
        DailyPractice practice = dailyPracticeId != null ? dailyPracticeService.selectById(dailyPracticeId) : null;

        DailyPracticeAnswerPageRequestVM requestVM = new DailyPracticeAnswerPageRequestVM();
        requestVM.setDailyPracticeId(dailyPracticeId);
        requestVM.setPageIndex(1);
        requestVM.setPageSize(10000);
        PageInfo<DailyPracticeAnswer> pageInfo = dailyPracticeAnswerService.pageBest(requestVM);
        List<DailyPracticeAnswer> answers = pageInfo.getList();

        int totalCount = answers.size();
        int maxScore = 0, minScore = Integer.MAX_VALUE;
        long totalScore = 0;
        int fullMarkCount = 0;
        for (DailyPracticeAnswer a : answers) {
            int s = a.getScore();
            totalScore += s;
            if (s > maxScore) maxScore = s;
            if (s < minScore) minScore = s;
            if (s == 100) fullMarkCount++;
        }
        if (totalCount == 0) minScore = 0;
        double avgScore = totalCount > 0 ? (double) totalScore / totalCount : 0;

        String title = practice != null ? practice.getTitle() + " - 练习成绩报告" : "每日一练 - 成绩报告";

        response.setContentType("application/pdf");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode(title, "UTF-8").replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".pdf");

        try {
            Document doc = PdfExportUtil.createDocument(response.getOutputStream());

            PdfExportUtil.addTitle(doc, title);
            PdfExportUtil.addSubtitle(doc, "导出时间：" + PdfExportUtil.now());

            PdfExportUtil.addSection(doc, "练习基本信息");
            List<String[]> info = new ArrayList<>();
            if (practice != null) {
                info.add(new String[]{"练习名称", practice.getTitle(), "题库标签", practice.getTag() != null ? practice.getTag() : ""});
                info.add(new String[]{"题目数量", String.valueOf(practice.getQuestionCount()), "创建时间", PdfExportUtil.formatDate(practice.getCreateTime())});
                info.add(new String[]{"练习说明", practice.getDescription() != null ? practice.getDescription() : "无"});
            } else {
                info.add(new String[]{"导出范围", "全部每日一练", "导出人", getCurrentUser().getUserName()});
            }
            PdfExportUtil.addInfoTable(doc, info);

            PdfExportUtil.addSection(doc, "统计概览");
            PdfExportUtil.addStatsBar(doc,
                new String[]{"参与人次", "满分人次", "最高分", "最低分", "平均分"},
                new String[]{
                    String.valueOf(totalCount),
                    String.valueOf(fullMarkCount),
                    String.valueOf(maxScore),
                    String.valueOf(minScore),
                    String.format("%.1f", avgScore)
                }
            );

            PdfExportUtil.addSection(doc, "成绩明细（共" + totalCount + "条最高分记录）");
            String[] headers = {"序号", "员工账号", "员工姓名", "练习名称", "得分", "正确/总题", "练习日期", "提交时间"};
            float[] widths = {0.5f, 1f, 1f, 1.5f, 0.7f, 0.8f, 1.2f, 1.5f};
            List<String[]> rows = new ArrayList<>();
            for (int i = 0; i < answers.size(); i++) {
                DailyPracticeAnswer a = answers.get(i);
                User user = userService.selectById(a.getUserId());
                String userName = user != null ? user.getUserName() : "";
                String realName = user != null && user.getRealName() != null ? user.getRealName() : "";
                DailyPractice dp = dailyPracticeService.selectById(a.getDailyPracticeId());
                String dpTitle = dp != null ? dp.getTitle() : "";
                rows.add(new String[]{
                    String.valueOf(i + 1),
                    userName,
                    realName,
                    dpTitle,
                    String.valueOf(a.getScore()),
                    a.getQuestionCorrect() + "/" + a.getQuestionCount(),
                    PdfExportUtil.formatDateShort(a.getPracticeDate()),
                    PdfExportUtil.formatDate(a.getCreateTime())
                });
            }
            PdfExportUtil.addDataTable(doc, headers, widths, rows, 4, "60");

            doc.close();
        } catch (Exception e) {
            throw new IOException("PDF生成失败: " + e.getMessage(), e);
        }
    }
}

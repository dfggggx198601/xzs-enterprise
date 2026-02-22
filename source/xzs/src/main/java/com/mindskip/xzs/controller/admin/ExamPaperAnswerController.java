package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.ExamPaper;
import com.mindskip.xzs.domain.ExamPaperAnswer;
import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.*;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.ExamUtil;
import com.mindskip.xzs.utility.PageInfoHelper;
import com.mindskip.xzs.utility.PdfExportUtil;
import com.mindskip.xzs.viewmodel.student.exampaper.ExamPaperAnswerPageResponseVM;
import com.mindskip.xzs.viewmodel.admin.paper.ExamPaperAnswerPageRequestVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperAnalysisVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperAnswerExportVM;
import com.itextpdf.text.Document;
import com.github.pagehelper.PageInfo;
import com.alibaba.excel.EasyExcel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController("AdminExamPaperAnswerController")
@RequestMapping(value = "/api/admin/examPaperAnswer")
public class ExamPaperAnswerController extends BaseApiController {

    private final ExamPaperAnswerService examPaperAnswerService;
    private final ExamPaperService examPaperService;
    private final SubjectService subjectService;
    private final UserService userService;

    @Autowired
    public ExamPaperAnswerController(ExamPaperAnswerService examPaperAnswerService,
            ExamPaperService examPaperService, SubjectService subjectService,
            UserService userService) {
        this.examPaperAnswerService = examPaperAnswerService;
        this.examPaperService = examPaperService;
        this.subjectService = subjectService;
        this.userService = userService;
    }

    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<ExamPaperAnswerPageResponseVM>> pageJudgeList(
            @RequestBody ExamPaperAnswerPageRequestVM model) {
        PageInfo<ExamPaperAnswer> pageInfo = examPaperAnswerService.adminPage(model);
        PageInfo<ExamPaperAnswerPageResponseVM> page = PageInfoHelper.copyMap(pageInfo, e -> {
            ExamPaperAnswerPageResponseVM vm = modelMapper.map(e, ExamPaperAnswerPageResponseVM.class);
            Subject subject = subjectService.selectById(vm.getSubjectId());
            vm.setDoTime(ExamUtil.secondToVM(e.getDoTime()));
            vm.setSystemScore(ExamUtil.scoreToVM(e.getSystemScore()));
            vm.setUserScore(ExamUtil.scoreToVM(e.getUserScore()));
            vm.setPaperScore(ExamUtil.scoreToVM(e.getPaperScore()));
            vm.setSubjectName(subject != null ? subject.getName() : "");
            vm.setCreateTime(DateTimeUtil.dateFormat(e.getCreateTime()));
            User user = e.getCreateUser() != null ? userService.selectById(e.getCreateUser()) : null;
            vm.setUserName(user != null ? user.getUserName() : "");
            return vm;
        });
        return RestResponse.ok(page);
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
    public RestResponse delete(@PathVariable Integer id) {
        ExamPaperAnswer examPaperAnswer = examPaperAnswerService.selectById(id);
        if (examPaperAnswer == null) {
            return RestResponse.fail(2, "记录不存在");
        }
        examPaperAnswerService.deleteById(id);
        return RestResponse.ok();
    }

    @RequestMapping(value = "/analysis", method = RequestMethod.POST)
    public RestResponse<List<ExamPaperAnalysisVM>> analysis() {
        List<ExamPaperAnalysisVM> list = examPaperAnswerService.analysis();
        return RestResponse.ok(list);
    }

    @RequestMapping(value = "/export/{examPaperId}", method = RequestMethod.GET)
    public void export(@PathVariable Integer examPaperId, HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.ms-excel");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("成绩表", "UTF-8");
        response.setHeader("Content-disposition", "attachment;filename=" + fileName + ".xlsx");

        ExamPaperAnswerPageRequestVM model = new ExamPaperAnswerPageRequestVM();
        model.setPageIndex(1);
        model.setPageSize(10000);
        model.setExamPaperId(examPaperId);

        PageInfo<ExamPaperAnswer> pageInfo = examPaperAnswerService.adminPage(model);
        List<ExamPaperAnswerExportVM> exportList = new ArrayList<>();

        for (ExamPaperAnswer e : pageInfo.getList()) {
            ExamPaperAnswerExportVM vm = new ExamPaperAnswerExportVM();
            vm.setPaperName(e.getPaperName());
            User user = userService.selectById(e.getCreateUser());
            vm.setUserName(user != null ? user.getUserName() : "Unknown");
            vm.setSystemScore(e.getSystemScore());
            vm.setUserScore(e.getUserScore());
            vm.setPaperScore(e.getPaperScore());
            vm.setDoTime(ExamUtil.secondToVM(e.getDoTime()));
            vm.setCreateTime(DateTimeUtil.dateFormat(e.getCreateTime()));
            exportList.add(vm);
        }

        EasyExcel.write(response.getOutputStream(), ExamPaperAnswerExportVM.class).sheet("成绩").doWrite(exportList);
    }

    @RequestMapping(value = "/exportPdf/{examPaperId}", method = RequestMethod.GET)
    public void exportPdf(@PathVariable Integer examPaperId, HttpServletResponse response) throws IOException {
        ExamPaper examPaper = examPaperService.selectById(examPaperId);
        if (examPaper == null) {
            response.sendError(404, "试卷不存在");
            return;
        }

        ExamPaperAnswerPageRequestVM model = new ExamPaperAnswerPageRequestVM();
        model.setPageIndex(1);
        model.setPageSize(10000);
        model.setExamPaperId(examPaperId);
        PageInfo<ExamPaperAnswer> pageInfo = examPaperAnswerService.adminPage(model);
        List<ExamPaperAnswer> answers = pageInfo.getList();

        Subject subject = subjectService.selectById(examPaper.getSubjectId());
        String paperType = examPaper.getPaperType() == 1 ? "固定试卷" : "时段试卷";
        String totalScore = ExamUtil.scoreToVM(examPaper.getScore());
        String passScore = String.valueOf(Math.round(examPaper.getScore() * 0.6 / 10.0));

        int totalCount = answers.size();
        int passCount = 0;
        int maxScore = 0, minScore = Integer.MAX_VALUE;
        long totalUserScore = 0;
        long totalDoTime = 0;
        for (ExamPaperAnswer a : answers) {
            int s = a.getUserScore();
            totalUserScore += s;
            totalDoTime += a.getDoTime();
            if (s > maxScore) maxScore = s;
            if (s < minScore) minScore = s;
            if (s >= examPaper.getScore() * 0.6) passCount++;
        }
        if (totalCount == 0) minScore = 0;
        double avgScore = totalCount > 0 ? totalUserScore / 10.0 / totalCount : 0;
        double avgDoTime = totalCount > 0 ? (double) totalDoTime / totalCount : 0;
        double passRate = totalCount > 0 ? passCount * 100.0 / totalCount : 0;

        response.setContentType("application/pdf");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode(examPaper.getName() + "-成绩报告", "UTF-8").replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".pdf");

        try {
            Document doc = PdfExportUtil.createDocument(response.getOutputStream());

            PdfExportUtil.addTitle(doc, examPaper.getName() + " - 成绩报告");
            PdfExportUtil.addSubtitle(doc, "导出时间：" + PdfExportUtil.now());

            PdfExportUtil.addSection(doc, "考试基本信息");
            List<String[]> info = new ArrayList<>();
            info.add(new String[]{"考试名称", examPaper.getName(), "试卷类型", paperType});
            info.add(new String[]{"业务范围", subject != null ? subject.getName() : "", "题目数量", String.valueOf(examPaper.getQuestionCount())});
            info.add(new String[]{"试卷总分", totalScore + "分", "及格标准", passScore + "分（60%）"});
            info.add(new String[]{"建议时长", examPaper.getSuggestTime() + "分钟", "发布时间", PdfExportUtil.formatDate(examPaper.getCreateTime())});
            if (examPaper.getLimitStartTime() != null) {
                info.add(new String[]{"开始时间", PdfExportUtil.formatDate(examPaper.getLimitStartTime()), "结束时间", PdfExportUtil.formatDate(examPaper.getLimitEndTime())});
            }
            PdfExportUtil.addInfoTable(doc, info);

            PdfExportUtil.addSection(doc, "统计概览");
            PdfExportUtil.addStatsBar(doc,
                new String[]{"参考人数", "及格人数", "及格率", "最高分", "最低分", "平均分"},
                new String[]{
                    String.valueOf(totalCount),
                    String.valueOf(passCount),
                    String.format("%.1f%%", passRate),
                    ExamUtil.scoreToVM(maxScore),
                    ExamUtil.scoreToVM(minScore),
                    String.format("%.1f", avgScore)
                }
            );

            PdfExportUtil.addSection(doc, "成绩明细（共" + totalCount + "人）");
            String[] headers = {"序号", "员工账号", "员工姓名", "得分", "试卷总分", "正确/总题", "用时", "提交时间", "是否及格"};
            float[] widths = {0.6f, 1.2f, 1.2f, 0.8f, 0.8f, 1f, 1.2f, 1.6f, 0.8f};
            List<String[]> rows = new ArrayList<>();
            for (int i = 0; i < answers.size(); i++) {
                ExamPaperAnswer a = answers.get(i);
                User user = userService.selectById(a.getCreateUser());
                String userName = user != null ? user.getUserName() : "";
                String realName = user != null && user.getRealName() != null ? user.getRealName() : "";
                boolean pass = a.getUserScore() >= examPaper.getScore() * 0.6;
                rows.add(new String[]{
                    String.valueOf(i + 1),
                    userName,
                    realName,
                    ExamUtil.scoreToVM(a.getUserScore()),
                    totalScore,
                    a.getQuestionCorrect() + "/" + a.getQuestionCount(),
                    ExamUtil.secondToVM(a.getDoTime()),
                    DateTimeUtil.dateFormat(a.getCreateTime()),
                    pass ? "及格" : "不及格"
                });
            }
            PdfExportUtil.addDataTable(doc, headers, widths, rows, 3, passScore);

            PdfExportUtil.addSection(doc, "补充说明");
            List<String[]> notes = new ArrayList<>();
            notes.add(new String[]{"平均用时", ExamUtil.secondToVM((int) avgDoTime), "导出人", getCurrentUser().getUserName()});
            PdfExportUtil.addInfoTable(doc, notes);

            doc.close();
        } catch (Exception e) {
            throw new IOException("PDF生成失败: " + e.getMessage(), e);
        }
    }
}

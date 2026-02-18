package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.ExamPaperAnswer;
import com.mindskip.xzs.domain.Subject;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.*;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.ExamUtil;
import com.mindskip.xzs.utility.PageInfoHelper;
import com.mindskip.xzs.viewmodel.student.exampaper.ExamPaperAnswerPageResponseVM;
import com.mindskip.xzs.viewmodel.admin.paper.ExamPaperAnswerPageRequestVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperAnalysisVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperAnswerExportVM;
import com.github.pagehelper.PageInfo;
import com.alibaba.excel.EasyExcel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

@RestController("AdminExamPaperAnswerController")
@RequestMapping(value = "/api/admin/examPaperAnswer")
public class ExamPaperAnswerController extends BaseApiController {

    private final ExamPaperAnswerService examPaperAnswerService;
    private final SubjectService subjectService;
    private final UserService userService;

    @Autowired
    public ExamPaperAnswerController(ExamPaperAnswerService examPaperAnswerService, SubjectService subjectService,
            UserService userService) {
        this.examPaperAnswerService = examPaperAnswerService;
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
            vm.setSubjectName(subject.getName());
            vm.setCreateTime(DateTimeUtil.dateFormat(e.getCreateTime()));
            User user = userService.selectById(e.getCreateUser());
            vm.setUserName(user.getUserName());
            return vm;
        });
        return RestResponse.ok(page);
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

}

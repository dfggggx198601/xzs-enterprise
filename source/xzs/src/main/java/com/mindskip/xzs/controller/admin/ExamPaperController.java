package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.ExamPaper;
import com.mindskip.xzs.domain.Question;
import com.mindskip.xzs.service.ExamPaperService;
import com.mindskip.xzs.service.QuestionService;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.PageInfoHelper;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperPageRequestVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamResponseVM;
import com.mindskip.xzs.viewmodel.admin.exam.RandomPaperVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperTitleItemVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionPageRequestVM;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController("AdminExamPaperController")
@RequestMapping(value = "/api/admin/exam/paper")
public class ExamPaperController extends BaseApiController {

    private final ExamPaperService examPaperService;
    private final QuestionService questionService;

    @Autowired
    public ExamPaperController(ExamPaperService examPaperService, QuestionService questionService) {
        this.examPaperService = examPaperService;
        this.questionService = questionService;
    }

    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<ExamResponseVM>> pageList(@RequestBody ExamPaperPageRequestVM model) {
        PageInfo<ExamPaper> pageInfo = examPaperService.page(model);
        PageInfo<ExamResponseVM> page = PageInfoHelper.copyMap(pageInfo, e -> {
            ExamResponseVM vm = modelMapper.map(e, ExamResponseVM.class);
            vm.setCreateTime(DateTimeUtil.dateFormat(e.getCreateTime()));
            return vm;
        });
        return RestResponse.ok(page);
    }

    @RequestMapping(value = "/edit", method = RequestMethod.POST)
    public RestResponse<ExamPaperEditRequestVM> edit(@RequestBody @Valid ExamPaperEditRequestVM model) {
        ExamPaper examPaper = examPaperService.savePaperFromVM(model, getCurrentUser());
        ExamPaperEditRequestVM newModel = examPaperService.examPaperToVM(examPaper.getId());
        return RestResponse.ok(newModel);
    }

    @RequestMapping(value = "/randomCreate", method = RequestMethod.POST)
    public RestResponse<ExamPaperEditRequestVM> randomCreate(
            @RequestBody @Valid RandomPaperVM model) {
        ExamPaperEditRequestVM paperVM = new ExamPaperEditRequestVM();
        paperVM.setSubjectId(model.getSubjectId());
        paperVM.setName(model.getName());
        paperVM.setSuggestTime(model.getSuggestTime());
        paperVM.setLevel(1);
        paperVM.setPaperType(1);
        paperVM.setTitleItems(new ArrayList<>());
        paperVM.setScore("100");

        addRandomQuestions(paperVM, model.getSubjectId(), model.getTag(), 1, model.getSingleCount(), "单选题");
        addRandomQuestions(paperVM, model.getSubjectId(), model.getTag(), 2, model.getMultiCount(), "多选题");
        addRandomQuestions(paperVM, model.getSubjectId(), model.getTag(), 3, model.getJudgeCount(), "判断题");
        addRandomQuestions(paperVM, model.getSubjectId(), model.getTag(), 4, model.getJudgeCount(), "填空题");
        addRandomQuestions(paperVM, model.getSubjectId(), model.getTag(), 5, model.getJudgeCount(), "简答题");

        int totalScore = paperVM.getTitleItems().stream().flatMap(t -> t.getQuestionItems().stream())
                .mapToInt(q -> com.mindskip.xzs.utility.ExamUtil.scoreFromVM(q.getScore())).sum();
        paperVM.setScore(com.mindskip.xzs.utility.ExamUtil.scoreToVM(totalScore));

        ExamPaper examPaper = examPaperService.savePaperFromVM(paperVM, getCurrentUser());
        ExamPaperEditRequestVM newModel = examPaperService.examPaperToVM(examPaper.getId());
        return RestResponse.ok(newModel);
    }

    @RequestMapping(value = "/createFromBank", method = RequestMethod.POST)
    public RestResponse<ExamPaperEditRequestVM> createFromBank(@RequestBody RandomPaperVM model) {
        QuestionPageRequestVM requestVM = new QuestionPageRequestVM();
        requestVM.setPageIndex(1);
        requestVM.setPageSize(10000);
        requestVM.setTag(model.getTag());

        PageInfo<Question> pageInfo = questionService.page(requestVM);
        List<Question> questions = pageInfo.getList();

        if (questions.isEmpty()) {
            return RestResponse.fail(2, "题库为空或未找到对应标签题目");
        }

        // Use subjectId from request if available, otherwise fallback to first
        // question's subject
        Integer subjectId = model.getSubjectId();
        if (subjectId == null) {
            subjectId = questions.get(0).getSubjectId();
        }

        ExamPaperEditRequestVM paperVM = new ExamPaperEditRequestVM();
        paperVM.setSubjectId(subjectId);
        paperVM.setName(model.getName());
        paperVM.setSuggestTime(model.getSuggestTime());
        paperVM.setLevel(1);
        paperVM.setPaperType(1);
        paperVM.setTitleItems(new ArrayList<>());

        Map<Integer, List<Question>> grouped = questions.stream()
                .collect(Collectors.groupingBy(Question::getQuestionType));

        for (int i = 1; i <= 5; i++) {
            if (grouped.containsKey(i)) {
                List<Question> qList = grouped.get(i);
                String titleName = getTypeName(i);
                ExamPaperTitleItemVM titleItem = new ExamPaperTitleItemVM();
                titleItem.setName(titleName);
                titleItem.setQuestionItems(new ArrayList<>());

                for (Question q : qList) {
                    QuestionEditRequestVM qVM = questionService.getQuestionEditRequestVM(q.getId());
                    titleItem.getQuestionItems().add(qVM);
                }
                paperVM.getTitleItems().add(titleItem);
            }
        }

        int totalScore = paperVM.getTitleItems().stream().flatMap(t -> t.getQuestionItems().stream())
                .mapToInt(q -> com.mindskip.xzs.utility.ExamUtil.scoreFromVM(q.getScore())).sum();
        paperVM.setScore(com.mindskip.xzs.utility.ExamUtil.scoreToVM(totalScore));

        ExamPaper examPaper = examPaperService.savePaperFromVM(paperVM, getCurrentUser());
        ExamPaperEditRequestVM newModel = examPaperService.examPaperToVM(examPaper.getId());
        return RestResponse.ok(newModel);
    }

    private String getTypeName(Integer type) {
        switch (type) {
            case 1:
                return "单选题";
            case 2:
                return "多选题";
            case 3:
                return "判断题";
            case 4:
                return "填空题";
            case 5:
                return "简答题";
            default:
                return "其他题目";
        }
    }

    private void addRandomQuestions(ExamPaperEditRequestVM paperVM, Integer subjectId, String tag, Integer type,
            Integer count, String titleName) {
        if (count == null || count <= 0)
            return;
        List<Question> questions = questionService.selectRandomByTag(subjectId, tag, type, count);
        if (questions.isEmpty())
            return;

        ExamPaperTitleItemVM titleItem = new ExamPaperTitleItemVM();
        titleItem.setName(titleName);
        titleItem.setQuestionItems(new ArrayList<>());

        for (Question q : questions) {
            QuestionEditRequestVM qVM = questionService.getQuestionEditRequestVM(q.getId());
            titleItem.getQuestionItems().add(qVM);
        }
        paperVM.getTitleItems().add(titleItem);
    }

    @RequestMapping(value = "/select/{id}", method = RequestMethod.POST)
    public RestResponse<ExamPaperEditRequestVM> select(@PathVariable Integer id) {
        ExamPaperEditRequestVM vm = examPaperService.examPaperToVM(id);
        return RestResponse.ok(vm);
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
    public RestResponse delete(@PathVariable Integer id) {
        ExamPaper examPaper = examPaperService.selectById(id);
        examPaper.setDeleted(true);
        examPaperService.updateByIdFilter(examPaper);
        return RestResponse.ok();
    }
}

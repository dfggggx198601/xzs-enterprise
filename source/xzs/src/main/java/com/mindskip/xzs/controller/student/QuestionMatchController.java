package com.mindskip.xzs.controller.student;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.service.QuestionService;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController("StudentQuestionMatchController")
@RequestMapping(value = "/api/student/question")
public class QuestionMatchController extends BaseApiController {

    private final QuestionService questionService;

    @Autowired
    public QuestionMatchController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @RequestMapping(value = "/match", method = RequestMethod.POST)
    public RestResponse<QuestionEditRequestVM> match(@RequestParam("screenText") String screenText) {
        QuestionEditRequestVM matched = questionService.matchQuestionByText(screenText);
        if (matched != null) {
            return RestResponse.ok(matched);
        }
        return RestResponse.fail(2, "未找到匹配的题目");
    }
}

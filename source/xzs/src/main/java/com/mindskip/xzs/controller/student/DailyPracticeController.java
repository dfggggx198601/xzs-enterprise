package com.mindskip.xzs.controller.student;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.DailyPractice;
import com.mindskip.xzs.domain.DailyPracticeAnswer;
import com.mindskip.xzs.domain.Question;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.DailyPracticeAnswerService;
import com.mindskip.xzs.service.DailyPracticeService;
import com.mindskip.xzs.service.QuestionService;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.JsonUtil;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController("StudentDailyPracticeController")
@RequestMapping(value = "/api/student/dailyPractice")
public class DailyPracticeController extends BaseApiController {

    private final DailyPracticeService dailyPracticeService;
    private final DailyPracticeAnswerService dailyPracticeAnswerService;
    private final QuestionService questionService;

    @Autowired
    public DailyPracticeController(DailyPracticeService dailyPracticeService,
                                    DailyPracticeAnswerService dailyPracticeAnswerService,
                                    QuestionService questionService) {
        this.dailyPracticeService = dailyPracticeService;
        this.dailyPracticeAnswerService = dailyPracticeAnswerService;
        this.questionService = questionService;
    }

    @RequestMapping(value = "/list", method = RequestMethod.POST)
    public RestResponse<List<Map<String, Object>>> list() {
        User user = getCurrentUser();
        List<DailyPractice> practices = dailyPracticeService.getByGradeLevel(user.getUserLevel());
        Date today = DateTimeUtil.getToday();
        List<Map<String, Object>> result = practices.stream().map(p -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", p.getId());
            map.put("title", p.getTitle());
            map.put("description", p.getDescription());
            map.put("questionCount", p.getQuestionCount());
            map.put("tag", p.getTag());
            DailyPracticeAnswer answer = dailyPracticeAnswerService.getByPracticeAndUserAndDate(
                    p.getId(), user.getId(), today);
            map.put("todayCompleted", answer != null);
            if (answer != null) {
                map.put("todayScore", answer.getScore());
                map.put("todayCorrect", answer.getQuestionCorrect());
            }
            return map;
        }).collect(Collectors.toList());
        return RestResponse.ok(result);
    }

    @RequestMapping(value = "/start/{id}", method = RequestMethod.POST)
    public RestResponse<Map<String, Object>> start(@PathVariable Integer id) {
        User user = getCurrentUser();
        DailyPractice practice = dailyPracticeService.selectById(id);
        if (practice == null) {
            return RestResponse.fail(2, "练习不存在");
        }

        List<Question> questions = questionService.selectRandomByTag(
                practice.getSubjectId(), practice.getTag(), null, practice.getQuestionCount());

        List<Map<String, Object>> questionList = questions.stream().map(q -> {
            QuestionEditRequestVM vm = questionService.getQuestionEditRequestVM(q);
            Map<String, Object> qMap = new LinkedHashMap<>();
            qMap.put("id", q.getId());
            qMap.put("questionType", q.getQuestionType());
            qMap.put("title", vm.getTitle());
            qMap.put("items", vm.getItems());
            return qMap;
        }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("practiceId", practice.getId());
        result.put("practiceTitle", practice.getTitle());
        result.put("questionCount", practice.getQuestionCount());
        result.put("questions", questionList);
        result.put("questionIds", questions.stream().map(q -> q.getId().toString()).collect(Collectors.joining(",")));
        return RestResponse.ok(result);
    }

    @RequestMapping(value = "/submit", method = RequestMethod.POST)
    public RestResponse<Map<String, Object>> submit(@RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        Integer practiceId = (Integer) body.get("practiceId");
        String questionIds = (String) body.get("questionIds");
        Integer doTime = body.get("doTime") != null ? (Integer) body.get("doTime") : 0;

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> answers = (List<Map<String, Object>>) body.get("answers");

        DailyPractice practice = dailyPracticeService.selectById(practiceId);
        if (practice == null) {
            return RestResponse.fail(2, "练习不存在");
        }

        int correctCount = 0;
        int totalCount = answers != null ? answers.size() : 0;

        if (answers != null) {
            for (Map<String, Object> ans : answers) {
                Object correctObj = ans.get("correct");
                if (correctObj != null && (Boolean) correctObj) {
                    correctCount++;
                }
            }
        }

        int score = totalCount > 0 ? (int) Math.round((double) correctCount / totalCount * 100) : 0;

        DailyPracticeAnswer answer = new DailyPracticeAnswer();
        answer.setDailyPracticeId(practiceId);
        answer.setUserId(user.getId());
        answer.setPracticeDate(DateTimeUtil.getToday());
        answer.setQuestionIds(questionIds);
        answer.setAnswerContent(JsonUtil.toJsonStr(answers));
        answer.setQuestionCount(totalCount);
        answer.setQuestionCorrect(correctCount);
        answer.setScore(score);
        answer.setDoTime(doTime);
        answer.setStatus(1);
        answer.setCreateTime(new Date());

        dailyPracticeAnswerService.insertByFilter(answer);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("score", score);
        result.put("correctCount", correctCount);
        result.put("totalCount", totalCount);
        return RestResponse.ok(result);
    }

    @RequestMapping(value = "/history", method = RequestMethod.POST)
    public RestResponse<List<Map<String, Object>>> history() {
        User user = getCurrentUser();
        List<DailyPracticeAnswer> answers = dailyPracticeAnswerService.getByUserId(user.getId());
        List<Map<String, Object>> result = answers.stream().map(a -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", a.getId());
            map.put("dailyPracticeId", a.getDailyPracticeId());
            DailyPractice dp = dailyPracticeService.selectById(a.getDailyPracticeId());
            if (dp != null) {
                map.put("practiceTitle", dp.getTitle());
            }
            map.put("score", a.getScore());
            map.put("questionCount", a.getQuestionCount());
            map.put("questionCorrect", a.getQuestionCorrect());
            map.put("doTime", a.getDoTime());
            map.put("practiceDate", DateTimeUtil.dateFormat(a.getPracticeDate()));
            map.put("createTime", DateTimeUtil.dateFormat(a.getCreateTime()));
            return map;
        }).collect(Collectors.toList());
        return RestResponse.ok(result);
    }
}

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
import com.github.pagehelper.PageInfo;
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
            DailyPracticeAnswer bestAnswer = dailyPracticeAnswerService.getBestByPracticeAndUserAndDate(
                    p.getId(), user.getId(), today);
            int todayAttempts = dailyPracticeAnswerService.countByPracticeAndUserAndDate(
                    p.getId(), user.getId(), today);
            map.put("todayAttempts", todayAttempts);
            if (bestAnswer != null) {
                map.put("todayBestScore", bestAnswer.getScore());
                map.put("todayBestCorrect", bestAnswer.getQuestionCorrect());
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
                Object questionIdObj = ans.get("questionId");
                if (questionIdObj == null) continue;
                Integer questionId = questionIdObj instanceof Integer ? (Integer) questionIdObj : Integer.parseInt(questionIdObj.toString());
                Question question = questionService.selectById(questionId);
                if (question == null) continue;
                QuestionEditRequestVM vm = questionService.getQuestionEditRequestVM(question);
                String userAnswer = ans.get("content") != null ? ans.get("content").toString().trim() : "";
                String correctAnswer = vm.getCorrect() != null ? vm.getCorrect().trim() : "";
                boolean isCorrect = false;
                if (question.getQuestionType() == 1 || question.getQuestionType() == 2 || question.getQuestionType() == 3) {
                    isCorrect = userAnswer.equalsIgnoreCase(correctAnswer);
                } else if (question.getQuestionType() == 4) {
                    isCorrect = userAnswer.equalsIgnoreCase(correctAnswer);
                }
                ans.put("correct", isCorrect);
                if (isCorrect) {
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

        DailyPracticeAnswer bestAnswer = dailyPracticeAnswerService.getBestByPracticeAndUserAndDate(
                practiceId, user.getId(), DateTimeUtil.getToday());
        int todayBestScore = bestAnswer != null ? bestAnswer.getScore() : score;
        boolean isNewBest = (bestAnswer == null || score >= todayBestScore);
        int todayAttempts = dailyPracticeAnswerService.countByPracticeAndUserAndDate(
                practiceId, user.getId(), DateTimeUtil.getToday());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("score", score);
        result.put("correctCount", correctCount);
        result.put("totalCount", totalCount);
        result.put("isNewBest", isNewBest);
        result.put("todayBestScore", todayBestScore);
        result.put("todayAttempts", todayAttempts);
        return RestResponse.ok(result);
    }

    @RequestMapping(value = "/history", method = RequestMethod.POST)
    public RestResponse<Map<String, Object>> history(@RequestBody Map<String, Object> body) {
        User user = getCurrentUser();
        Integer pageIndex = body.get("pageIndex") != null ? (Integer) body.get("pageIndex") : 1;
        Integer pageSize = body.get("pageSize") != null ? (Integer) body.get("pageSize") : 10;
        PageInfo<DailyPracticeAnswer> pageInfo = dailyPracticeAnswerService.pageByUserId(user.getId(), pageIndex, pageSize);
        List<Map<String, Object>> list = pageInfo.getList().stream().map(a -> {
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
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("list", list);
        result.put("total", pageInfo.getTotal());
        result.put("pageNum", pageInfo.getPageNum());
        return RestResponse.ok(result);
    }
}

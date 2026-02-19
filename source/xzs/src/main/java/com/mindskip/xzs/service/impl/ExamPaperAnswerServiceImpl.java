package com.mindskip.xzs.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.domain.*;
import com.mindskip.xzs.domain.enums.ExamPaperAnswerStatusEnum;
import com.mindskip.xzs.domain.enums.QuestionTypeEnum;
import com.mindskip.xzs.repository.ExamPaperAnswerMapper;
import com.mindskip.xzs.repository.ExamPaperMapper;
import com.mindskip.xzs.repository.ExamPaperQuestionCustomerAnswerMapper;
import com.mindskip.xzs.repository.QuestionMapper;
import com.mindskip.xzs.repository.SubjectMapper;
import com.mindskip.xzs.service.ExamPaperAnswerService;
import com.mindskip.xzs.utility.ExamUtil;
import com.mindskip.xzs.utility.JsonUtil;
import com.mindskip.xzs.viewmodel.student.exam.ExamPaperSubmitItemVM;
import com.mindskip.xzs.viewmodel.student.exam.ExamPaperSubmitVM;
import com.mindskip.xzs.viewmodel.student.exampaper.ExamPaperAnswerPageVM;
import com.mindskip.xzs.viewmodel.admin.exam.ExamPaperAnalysisVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamPaperAnswerServiceImpl extends BaseServiceImpl<ExamPaperAnswer> implements ExamPaperAnswerService {

    private final ExamPaperAnswerMapper examPaperAnswerMapper;
    private final ExamPaperMapper examPaperMapper;
    private final QuestionMapper questionMapper;
    private final SubjectMapper subjectMapper;
    private final ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper;

    @Autowired
    public ExamPaperAnswerServiceImpl(ExamPaperAnswerMapper examPaperAnswerMapper, ExamPaperMapper examPaperMapper,
            QuestionMapper questionMapper, SubjectMapper subjectMapper,
            ExamPaperQuestionCustomerAnswerMapper examPaperQuestionCustomerAnswerMapper) {
        super(examPaperAnswerMapper);
        this.examPaperAnswerMapper = examPaperAnswerMapper;
        this.examPaperMapper = examPaperMapper;
        this.questionMapper = questionMapper;
        this.subjectMapper = subjectMapper;
        this.examPaperQuestionCustomerAnswerMapper = examPaperQuestionCustomerAnswerMapper;
    }

    @Override
    public PageInfo<ExamPaperAnswer> studentPage(ExamPaperAnswerPageVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc")
                .doSelectPageInfo(() -> examPaperAnswerMapper.studentPage(requestVM));
    }

    @Override
    public ExamPaperAnswerInfo calculateExamPaperAnswer(ExamPaperSubmitVM examPaperSubmitVM, User user) {
        Date now = new Date();
        ExamPaper examPaper = examPaperMapper.selectByPrimaryKey(examPaperSubmitVM.getId());
        if (examPaper == null) {
            return null;
        }

        // Check duplicate submission
        ExamPaperAnswer existAnswer = examPaperAnswerMapper.getByPidUid(examPaper.getId(), user.getId());
        if (existAnswer != null) {
            return null;
        }

        // Fetch all questions
        List<Integer> questionIds = examPaperSubmitVM.getAnswerItems().stream()
                .map(ExamPaperSubmitItemVM::getQuestionId)
                .collect(Collectors.toList());
        List<Question> questions = questionMapper.selectByIds(questionIds);

        // Calculate scores and build customer answer records
        int systemScore = 0;
        int questionCorrect = 0;
        boolean hasSubjective = false;
        List<ExamPaperQuestionCustomerAnswer> customerAnswers = new ArrayList<>();

        for (ExamPaperSubmitItemVM item : examPaperSubmitVM.getAnswerItems()) {
            Question question = questions.stream()
                    .filter(q -> q.getId().equals(item.getQuestionId()))
                    .findFirst().orElse(null);
            if (question == null) continue;

            ExamPaperQuestionCustomerAnswer ca = new ExamPaperQuestionCustomerAnswer();
            ca.setQuestionId(question.getId());
            ca.setExamPaperId(examPaper.getId());
            ca.setQuestionType(question.getQuestionType());
            ca.setSubjectId(examPaper.getSubjectId());
            ca.setQuestionScore(question.getScore());
            ca.setQuestionTextContentId(question.getInfoTextContentId());
            ca.setCreateUser(user.getId());
            ca.setCreateTime(now);
            ca.setItemOrder(item.getItemOrder());

            // Build answer content
            if (item.getContentArray() != null && !item.getContentArray().isEmpty()) {
                ca.setAnswer(ExamUtil.contentToString(item.getContentArray()));
            } else if (item.getContent() != null) {
                ca.setAnswer(item.getContent());
            }

            QuestionTypeEnum questionType = QuestionTypeEnum.fromCode(question.getQuestionType());

            switch (questionType) {
                case SingleChoice:
                case TrueFalse: {
                    boolean correct = question.getCorrect().equals(item.getContent());
                    ca.setDoRight(correct);
                    if (correct) {
                        systemScore += question.getScore();
                        questionCorrect++;
                        ca.setCustomerScore(question.getScore());
                    } else {
                        ca.setCustomerScore(0);
                    }
                    break;
                }
                case MultipleChoice: {
                    String userAnswer = (item.getContentArray() != null)
                            ? ExamUtil.contentToString(item.getContentArray()) : "";
                    boolean correct = question.getCorrect().equals(userAnswer);
                    ca.setDoRight(correct);
                    if (correct) {
                        systemScore += question.getScore();
                        questionCorrect++;
                        ca.setCustomerScore(question.getScore());
                    } else {
                        ca.setCustomerScore(0);
                    }
                    break;
                }
                case GapFilling:
                case ShortAnswer: {
                    hasSubjective = true;
                    ca.setDoRight(null);
                    ca.setCustomerScore(0);
                    break;
                }
            }

            customerAnswers.add(ca);
        }

        // Build ExamPaperAnswer
        ExamPaperAnswer examPaperAnswer = new ExamPaperAnswer();
        examPaperAnswer.setExamPaperId(examPaper.getId());
        examPaperAnswer.setPaperName(examPaper.getName());
        examPaperAnswer.setPaperType(examPaper.getPaperType());
        examPaperAnswer.setCreateUser(user.getId());
        examPaperAnswer.setCreateTime(now);
        examPaperAnswer.setSubjectId(examPaper.getSubjectId());
        examPaperAnswer.setPaperScore(examPaper.getScore());
        examPaperAnswer.setQuestionCount(examPaper.getQuestionCount());
        examPaperAnswer.setSystemScore(systemScore);
        examPaperAnswer.setUserScore(systemScore);
        examPaperAnswer.setQuestionCorrect(questionCorrect);
        examPaperAnswer.setDoTime(examPaperSubmitVM.getDoTime());

        if (hasSubjective) {
            examPaperAnswer.setStatus(ExamPaperAnswerStatusEnum.WaitJudge.getCode());
        } else {
            examPaperAnswer.setStatus(ExamPaperAnswerStatusEnum.Complete.getCode());
        }

        // Build info with all three pieces
        ExamPaperAnswerInfo info = new ExamPaperAnswerInfo();
        info.setExamPaper(examPaper);
        info.setExamPaperAnswer(examPaperAnswer);
        info.setExamPaperQuestionCustomerAnswers(customerAnswers);

        return info;
    }

    @Override
    @Transactional
    public String judge(ExamPaperSubmitVM examPaperSubmitVM) {
        ExamPaperAnswer examPaperAnswer = examPaperAnswerMapper.selectByPrimaryKey(examPaperSubmitVM.getId());
        if (examPaperAnswer == null) {
            return "";
        }

        List<ExamPaperSubmitItemVM> answerItems = examPaperSubmitVM.getAnswerItems();
        int userScore = 0;
        int questionCorrect = 0;

        for (ExamPaperSubmitItemVM item : answerItems) {
            if (item.getDoRight() != null && item.getDoRight()) {
                questionCorrect++;
            }
            if (item.getScore() != null) {
                userScore += ExamUtil.scoreFromVM(item.getScore());
            }
        }

        examPaperAnswer.setUserScore(userScore);
        examPaperAnswer.setQuestionCorrect(questionCorrect);
        examPaperAnswer.setStatus(ExamPaperAnswerStatusEnum.Complete.getCode());
        examPaperAnswerMapper.updateByPrimaryKeySelective(examPaperAnswer);

        return ExamUtil.scoreToVM(userScore);
    }

    @Override
    public ExamPaperSubmitVM examPaperAnswerToVM(Integer id) {
        ExamPaperAnswer examPaperAnswer = examPaperAnswerMapper.selectByPrimaryKey(id);
        if (examPaperAnswer == null) {
            return null;
        }
        ExamPaperSubmitVM vm = new ExamPaperSubmitVM();
        vm.setId(examPaperAnswer.getId());
        vm.setDoTime(examPaperAnswer.getDoTime());
        vm.setScore(ExamUtil.scoreToVM(examPaperAnswer.getUserScore()));

        List<ExamPaperQuestionCustomerAnswer> customerAnswers =
                examPaperQuestionCustomerAnswerMapper.selectListByPaperAnswerId(id);
        List<ExamPaperSubmitItemVM> items = new ArrayList<>();
        if (customerAnswers != null) {
            for (ExamPaperQuestionCustomerAnswer ca : customerAnswers) {
                ExamPaperSubmitItemVM item = new ExamPaperSubmitItemVM();
                item.setId(ca.getId());
                item.setQuestionId(ca.getQuestionId());
                item.setDoRight(ca.getDoRight());
                item.setItemOrder(ca.getItemOrder());
                item.setScore(ExamUtil.scoreToVM(ca.getCustomerScore()));
                item.setQuestionScore(ExamUtil.scoreToVM(ca.getQuestionScore()));

                String answer = ca.getAnswer();
                if (answer != null && answer.contains(",")) {
                    item.setContentArray(ExamUtil.contentToArray(answer));
                    item.setContent(answer);
                } else {
                    item.setContent(answer);
                    item.setContentArray(new ArrayList<>());
                }
                items.add(item);
            }
        }
        vm.setAnswerItems(items);
        return vm;
    }

    @Override
    public Integer selectAllCount() {
        return examPaperAnswerMapper.selectAllCount();
    }

    @Override
    public List<Integer> selectMothCount() {
        return null;
    }

    @Override
    public PageInfo<ExamPaperAnswer> adminPage(
            com.mindskip.xzs.viewmodel.admin.paper.ExamPaperAnswerPageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc")
                .doSelectPageInfo(() -> examPaperAnswerMapper.adminPage(requestVM));
    }

    @Override
    public List<ExamPaperAnalysisVM> analysis() {
        return examPaperAnswerMapper.paperAnalysis();
    }
}

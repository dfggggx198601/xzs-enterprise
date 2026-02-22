package com.mindskip.xzs.viewmodel.student.question.answer;

import com.mindskip.xzs.domain.question.QuestionItemObject;
import java.util.List;

public class QuestionPageStudentResponseVM {
    private Integer id;
    private Integer questionType;
    private String createTime;
    private String subjectName;
    private String shortTitle;
    private String fullTitle;
    private String correctAnswer;
    private String yourAnswer;
    private List<QuestionItemObject> questionItems;
    private String analyze;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getQuestionType() {
        return questionType;
    }

    public void setQuestionType(Integer questionType) {
        this.questionType = questionType;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getShortTitle() {
        return shortTitle;
    }

    public void setShortTitle(String shortTitle) {
        this.shortTitle = shortTitle;
    }

    public String getFullTitle() {
        return fullTitle;
    }

    public void setFullTitle(String fullTitle) {
        this.fullTitle = fullTitle;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getYourAnswer() {
        return yourAnswer;
    }

    public void setYourAnswer(String yourAnswer) {
        this.yourAnswer = yourAnswer;
    }

    public List<QuestionItemObject> getQuestionItems() {
        return questionItems;
    }

    public void setQuestionItems(List<QuestionItemObject> questionItems) {
        this.questionItems = questionItems;
    }

    public String getAnalyze() {
        return analyze;
    }

    public void setAnalyze(String analyze) {
        this.analyze = analyze;
    }
}

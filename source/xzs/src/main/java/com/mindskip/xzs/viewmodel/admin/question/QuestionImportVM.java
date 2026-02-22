package com.mindskip.xzs.viewmodel.admin.question;

import com.alibaba.excel.annotation.ExcelProperty;

public class QuestionImportVM {

    @ExcelProperty("序号")
    private Integer index;

    @ExcelProperty("题型")
    private String questionType;

    @ExcelProperty("题干")
    private String title;

    @ExcelProperty("选项a")
    private String optionA;

    @ExcelProperty("选项b")
    private String optionB;

    @ExcelProperty("选项c")
    private String optionC;

    @ExcelProperty("选项d")
    private String optionD;

    @ExcelProperty("选项e")
    private String optionE;

    @ExcelProperty("选项f")
    private String optionF;

    @ExcelProperty("答案")
    private String answer;

    @ExcelProperty("解析")
    private String analyze;

    @ExcelProperty("分数")
    private String score;

    @ExcelProperty("难度")
    private Integer difficult;

    public Integer getIndex() {
        return index;
    }

    public void setIndex(Integer index) {
        this.index = index;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public String getOptionE() {
        return optionE;
    }

    public void setOptionE(String optionE) {
        this.optionE = optionE;
    }

    public String getOptionF() {
        return optionF;
    }

    public void setOptionF(String optionF) {
        this.optionF = optionF;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public String getAnalyze() {
        return analyze;
    }

    public void setAnalyze(String analyze) {
        this.analyze = analyze;
    }

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }

    public Integer getDifficult() {
        return difficult;
    }

    public void setDifficult(Integer difficult) {
        this.difficult = difficult;
    }
}

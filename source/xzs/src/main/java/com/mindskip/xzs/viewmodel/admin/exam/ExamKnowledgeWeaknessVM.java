package com.mindskip.xzs.viewmodel.admin.exam;

public class ExamKnowledgeWeaknessVM {
    private Integer examPaperId;
    private String paperName;
    private Integer questionType;
    private Integer totalCount;
    private Integer wrongCount;
    private Double wrongRate;

    public Integer getExamPaperId() {
        return examPaperId;
    }

    public void setExamPaperId(Integer examPaperId) {
        this.examPaperId = examPaperId;
    }

    public String getPaperName() {
        return paperName;
    }

    public void setPaperName(String paperName) {
        this.paperName = paperName;
    }

    public Integer getQuestionType() {
        return questionType;
    }

    public void setQuestionType(Integer questionType) {
        this.questionType = questionType;
    }

    public Integer getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }

    public Integer getWrongCount() {
        return wrongCount;
    }

    public void setWrongCount(Integer wrongCount) {
        this.wrongCount = wrongCount;
    }

    public Double getWrongRate() {
        return wrongRate;
    }

    public void setWrongRate(Double wrongRate) {
        this.wrongRate = wrongRate;
    }
}

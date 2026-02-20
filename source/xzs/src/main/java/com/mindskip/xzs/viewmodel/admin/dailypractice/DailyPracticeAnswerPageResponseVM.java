package com.mindskip.xzs.viewmodel.admin.dailypractice;

public class DailyPracticeAnswerPageResponseVM {

    private Integer id;

    private Integer dailyPracticeId;

    private String dailyPracticeTitle;

    private Integer userId;

    private String userName;

    private String practiceDate;

    private Integer questionCount;

    private Integer questionCorrect;

    private Integer score;

    private Integer doTime;

    private Integer status;

    private String createTime;

    private Boolean isBest;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getDailyPracticeId() {
        return dailyPracticeId;
    }

    public void setDailyPracticeId(Integer dailyPracticeId) {
        this.dailyPracticeId = dailyPracticeId;
    }

    public String getDailyPracticeTitle() {
        return dailyPracticeTitle;
    }

    public void setDailyPracticeTitle(String dailyPracticeTitle) {
        this.dailyPracticeTitle = dailyPracticeTitle;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPracticeDate() {
        return practiceDate;
    }

    public void setPracticeDate(String practiceDate) {
        this.practiceDate = practiceDate;
    }

    public Integer getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(Integer questionCount) {
        this.questionCount = questionCount;
    }

    public Integer getQuestionCorrect() {
        return questionCorrect;
    }

    public void setQuestionCorrect(Integer questionCorrect) {
        this.questionCorrect = questionCorrect;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getDoTime() {
        return doTime;
    }

    public void setDoTime(Integer doTime) {
        this.doTime = doTime;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public Boolean getIsBest() {
        return isBest;
    }

    public void setIsBest(Boolean isBest) {
        this.isBest = isBest;
    }
}

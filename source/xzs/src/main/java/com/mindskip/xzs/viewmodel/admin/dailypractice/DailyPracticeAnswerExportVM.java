package com.mindskip.xzs.viewmodel.admin.dailypractice;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;

@ColumnWidth(18)
public class DailyPracticeAnswerExportVM {

    @ExcelProperty("员工账号")
    private String userName;

    @ExcelProperty("员工姓名")
    private String realName;

    @ExcelProperty("练习名称")
    @ColumnWidth(25)
    private String dailyPracticeTitle;

    @ExcelProperty("得分")
    private Integer score;

    @ExcelProperty("题目数")
    private Integer questionCount;

    @ExcelProperty("正确数")
    private Integer questionCorrect;

    @ExcelProperty("练习日期")
    private String practiceDate;

    @ExcelProperty("提交时间")
    @ColumnWidth(22)
    private String createTime;

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getRealName() { return realName; }
    public void setRealName(String realName) { this.realName = realName; }

    public String getDailyPracticeTitle() { return dailyPracticeTitle; }
    public void setDailyPracticeTitle(String dailyPracticeTitle) { this.dailyPracticeTitle = dailyPracticeTitle; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }

    public Integer getQuestionCorrect() { return questionCorrect; }
    public void setQuestionCorrect(Integer questionCorrect) { this.questionCorrect = questionCorrect; }

    public String getPracticeDate() { return practiceDate; }
    public void setPracticeDate(String practiceDate) { this.practiceDate = practiceDate; }

    public String getCreateTime() { return createTime; }
    public void setCreateTime(String createTime) { this.createTime = createTime; }
}

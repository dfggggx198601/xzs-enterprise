package com.mindskip.xzs.viewmodel.admin.exam;

import com.alibaba.excel.annotation.ExcelProperty;
import java.util.Date;

public class ExamPaperAnswerExportVM {
    @ExcelProperty("试卷名称")
    private String paperName;
    @ExcelProperty("用户名称")
    private String userName;
    @ExcelProperty("系统得分")
    private Integer systemScore;
    @ExcelProperty("用户得分")
    private Integer userScore;
    @ExcelProperty("试卷总分")
    private Integer paperScore;
    @ExcelProperty("做题时间")
    private String doTime;
    @ExcelProperty("提交时间")
    private String createTime;

    public String getPaperName() {
        return paperName;
    }

    public void setPaperName(String paperName) {
        this.paperName = paperName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getSystemScore() {
        return systemScore;
    }

    public void setSystemScore(Integer systemScore) {
        this.systemScore = systemScore;
    }

    public Integer getUserScore() {
        return userScore;
    }

    public void setUserScore(Integer userScore) {
        this.userScore = userScore;
    }

    public Integer getPaperScore() {
        return paperScore;
    }

    public void setPaperScore(Integer paperScore) {
        this.paperScore = paperScore;
    }

    public String getDoTime() {
        return doTime;
    }

    public void setDoTime(String doTime) {
        this.doTime = doTime;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }
}

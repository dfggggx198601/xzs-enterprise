package com.mindskip.xzs.viewmodel.admin.dailypractice;

import com.mindskip.xzs.base.BasePage;

public class DailyPracticeAnswerPageRequestVM extends BasePage {

    private Integer dailyPracticeId;

    private Integer gradeLevel;

    public Integer getDailyPracticeId() {
        return dailyPracticeId;
    }

    public void setDailyPracticeId(Integer dailyPracticeId) {
        this.dailyPracticeId = dailyPracticeId;
    }

    public Integer getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(Integer gradeLevel) {
        this.gradeLevel = gradeLevel;
    }
}

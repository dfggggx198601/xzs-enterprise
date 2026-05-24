package com.mindskip.xzs.viewmodel.admin.exam;

import javax.validation.constraints.NotNull;
import java.util.List;

public class RandomPaperVM {
    @NotNull
    private Integer subjectId;
    @NotNull
    private String tag;
    private Integer singleCount;
    private Integer multiCount;
    private Integer judgeCount;
    private String singleScore;
    private String multiScore;
    private String judgeScore;
    @NotNull
    private String name;
    @NotNull
    private Integer suggestTime;

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public Integer getSingleCount() {
        return singleCount;
    }

    public void setSingleCount(Integer singleCount) {
        this.singleCount = singleCount;
    }

    public Integer getMultiCount() {
        return multiCount;
    }

    public void setMultiCount(Integer multiCount) {
        this.multiCount = multiCount;
    }

    public Integer getJudgeCount() {
        return judgeCount;
    }

    public void setJudgeCount(Integer judgeCount) {
        this.judgeCount = judgeCount;
    }

    public String getSingleScore() {
        return singleScore;
    }

    public void setSingleScore(String singleScore) {
        this.singleScore = singleScore;
    }

    public String getMultiScore() {
        return multiScore;
    }

    public void setMultiScore(String multiScore) {
        this.multiScore = multiScore;
    }

    public String getJudgeScore() {
        return judgeScore;
    }

    public void setJudgeScore(String judgeScore) {
        this.judgeScore = judgeScore;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSuggestTime() {
        return suggestTime;
    }

    public void setSuggestTime(Integer suggestTime) {
        this.suggestTime = suggestTime;
    }
}

package com.mindskip.xzs.viewmodel.admin.exam;

import java.util.List;

public class ExamReportVM {
    private ExamReportSummaryVM summary;
    private List<ExamReportByBusinessLineVM> byBusinessLine;
    private List<ExamKnowledgeWeaknessVM> weaknesses;

    public ExamReportSummaryVM getSummary() {
        return summary;
    }

    public void setSummary(ExamReportSummaryVM summary) {
        this.summary = summary;
    }

    public List<ExamReportByBusinessLineVM> getByBusinessLine() {
        return byBusinessLine;
    }

    public void setByBusinessLine(List<ExamReportByBusinessLineVM> byBusinessLine) {
        this.byBusinessLine = byBusinessLine;
    }

    public List<ExamKnowledgeWeaknessVM> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<ExamKnowledgeWeaknessVM> weaknesses) {
        this.weaknesses = weaknesses;
    }
}

package com.mindskip.xzs.utility;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.mindskip.xzs.viewmodel.admin.question.QuestionImportVM;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Format A (template): 序号 | 题型 | 题干 | 选项a | 选项b | 选项c | 选项d | 答案 | 解析 | 分数 | 难度
 * Format B (user):     题型 | 题目 | 选项1 | 选项2 | 选项3 | 选项4 | 选项5 | 选项6 | 对答案
 */
public class FlexibleQuestionImportListener extends AnalysisEventListener<Map<Integer, String>> {

    private final List<QuestionImportVM> dataList = new ArrayList<>();
    private final Map<String, Integer> headerMap = new HashMap<>();

    @Override
    public void invokeHeadMap(Map<Integer, String> headMap, AnalysisContext context) {
        for (Map.Entry<Integer, String> entry : headMap.entrySet()) {
            if (entry.getValue() != null) {
                headerMap.put(entry.getValue().trim().toLowerCase(), entry.getKey());
            }
        }
    }

    @Override
    public void invoke(Map<Integer, String> rowData, AnalysisContext context) {
        if (rowData == null || rowData.isEmpty()) {
            return;
        }

        QuestionImportVM vm = new QuestionImportVM();
        vm.setIndex(parseInteger(getCellValue(rowData, "序号")));
        vm.setQuestionType(getCellValue(rowData, "题型"));
        vm.setTitle(firstNonEmpty(getCellValue(rowData, "题干"), getCellValue(rowData, "题目")));
        vm.setOptionA(firstNonEmpty(getCellValue(rowData, "选项a"), getCellValue(rowData, "选项1")));
        vm.setOptionB(firstNonEmpty(getCellValue(rowData, "选项b"), getCellValue(rowData, "选项2")));
        vm.setOptionC(firstNonEmpty(getCellValue(rowData, "选项c"), getCellValue(rowData, "选项3")));
        vm.setOptionD(firstNonEmpty(getCellValue(rowData, "选项d"), getCellValue(rowData, "选项4")));
        vm.setOptionE(firstNonEmpty(getCellValue(rowData, "选项e"), getCellValue(rowData, "选项5")));
        vm.setOptionF(firstNonEmpty(getCellValue(rowData, "选项f"), getCellValue(rowData, "选项6")));
        vm.setAnswer(firstNonEmpty(getCellValue(rowData, "答案"), getCellValue(rowData, "对答案")));
        vm.setAnalyze(getCellValue(rowData, "解析"));
        vm.setScore(getCellValue(rowData, "分数"));
        vm.setDifficult(parseInteger(getCellValue(rowData, "难度")));
        dataList.add(vm);
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
    }

    public List<QuestionImportVM> getDataList() {
        return dataList;
    }

    private String getCellValue(Map<Integer, String> rowData, String headerName) {
        Integer colIndex = headerMap.get(headerName.toLowerCase());
        if (colIndex == null) {
            return null;
        }
        String value = rowData.get(colIndex);
        return value != null ? value.trim() : null;
    }

    private String firstNonEmpty(String... values) {
        for (String v : values) {
            if (v != null && !v.isEmpty()) {
                return v;
            }
        }
        return null;
    }

    private Integer parseInteger(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        try {
            if (value.contains(".")) {
                return (int) Double.parseDouble(value);
            }
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}

package com.mindskip.xzs.controller.common;

import com.alibaba.excel.EasyExcel;
import com.mindskip.xzs.viewmodel.admin.question.QuestionImportVM;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/public/question")
public class QuestionTemplateController {

    @RequestMapping(value = "/import/template", method = RequestMethod.GET)
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("题目导入模板", "UTF-8").replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

        List<QuestionImportVM> demo = new ArrayList<>();
        QuestionImportVM row = new QuestionImportVM();
        row.setIndex(1);
        row.setQuestionType("单选题");
        row.setTitle("以下哪个是Java的基本数据类型？");
        row.setOptionA("String");
        row.setOptionB("int");
        row.setOptionC("Integer");
        row.setOptionD("List");
        row.setAnswer("B");
        row.setAnalyze("int是Java的8种基本数据类型之一");
        row.setScore("5");
        row.setDifficult(1);
        demo.add(row);

        EasyExcel.write(response.getOutputStream(), QuestionImportVM.class).sheet("模板").doWrite(demo);
    }
}

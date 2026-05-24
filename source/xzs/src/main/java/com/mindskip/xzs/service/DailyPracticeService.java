package com.mindskip.xzs.service;

import com.mindskip.xzs.domain.DailyPractice;
import com.mindskip.xzs.viewmodel.admin.dailypractice.DailyPracticePageRequestVM;
import com.github.pagehelper.PageInfo;

import java.util.List;

public interface DailyPracticeService extends BaseService<DailyPractice> {

    PageInfo<DailyPractice> page(DailyPracticePageRequestVM requestVM);

    void edit(DailyPractice dailyPractice);

    List<DailyPractice> getByGradeLevel(Integer gradeLevel);
}

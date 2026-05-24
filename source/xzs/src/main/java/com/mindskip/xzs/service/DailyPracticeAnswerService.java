package com.mindskip.xzs.service;

import com.mindskip.xzs.domain.DailyPracticeAnswer;
import com.mindskip.xzs.viewmodel.admin.dailypractice.DailyPracticeAnswerPageRequestVM;
import com.github.pagehelper.PageInfo;

import java.util.Date;
import java.util.List;

public interface DailyPracticeAnswerService extends BaseService<DailyPracticeAnswer> {

    PageInfo<DailyPracticeAnswer> page(DailyPracticeAnswerPageRequestVM requestVM);

    DailyPracticeAnswer getByPracticeAndUserAndDate(Integer dailyPracticeId, Integer userId, Date practiceDate);

    List<DailyPracticeAnswer> getByUserId(Integer userId);

    List<DailyPracticeAnswer> getByDailyPracticeId(Integer dailyPracticeId);

    DailyPracticeAnswer getBestByPracticeAndUserAndDate(Integer dailyPracticeId, Integer userId, Date practiceDate);

    int countByPracticeAndUserAndDate(Integer dailyPracticeId, Integer userId, Date practiceDate);

    PageInfo<DailyPracticeAnswer> pageByUserId(Integer userId, Integer pageIndex, Integer pageSize);

    PageInfo<DailyPracticeAnswer> pageBest(DailyPracticeAnswerPageRequestVM requestVM);
}

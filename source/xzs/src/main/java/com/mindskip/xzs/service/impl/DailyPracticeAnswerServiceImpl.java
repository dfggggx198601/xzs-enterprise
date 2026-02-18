package com.mindskip.xzs.service.impl;

import com.mindskip.xzs.domain.DailyPracticeAnswer;
import com.mindskip.xzs.repository.DailyPracticeAnswerMapper;
import com.mindskip.xzs.service.DailyPracticeAnswerService;
import com.mindskip.xzs.viewmodel.admin.dailypractice.DailyPracticeAnswerPageRequestVM;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class DailyPracticeAnswerServiceImpl extends BaseServiceImpl<DailyPracticeAnswer> implements DailyPracticeAnswerService {

    private final DailyPracticeAnswerMapper dailyPracticeAnswerMapper;

    @Autowired
    public DailyPracticeAnswerServiceImpl(DailyPracticeAnswerMapper dailyPracticeAnswerMapper) {
        super(dailyPracticeAnswerMapper);
        this.dailyPracticeAnswerMapper = dailyPracticeAnswerMapper;
    }

    @Override
    public PageInfo<DailyPracticeAnswer> page(DailyPracticeAnswerPageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc").doSelectPageInfo(() ->
                dailyPracticeAnswerMapper.page(requestVM)
        );
    }

    @Override
    public DailyPracticeAnswer getByPracticeAndUserAndDate(Integer dailyPracticeId, Integer userId, Date practiceDate) {
        return dailyPracticeAnswerMapper.getByPracticeAndUserAndDate(dailyPracticeId, userId, practiceDate);
    }

    @Override
    public List<DailyPracticeAnswer> getByUserId(Integer userId) {
        return dailyPracticeAnswerMapper.getByUserId(userId);
    }

    @Override
    public List<DailyPracticeAnswer> getByDailyPracticeId(Integer dailyPracticeId) {
        return dailyPracticeAnswerMapper.getByDailyPracticeId(dailyPracticeId);
    }
}

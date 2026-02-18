package com.mindskip.xzs.service.impl;

import com.mindskip.xzs.domain.DailyPractice;
import com.mindskip.xzs.repository.DailyPracticeMapper;
import com.mindskip.xzs.service.DailyPracticeService;
import com.mindskip.xzs.viewmodel.admin.dailypractice.DailyPracticePageRequestVM;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DailyPracticeServiceImpl extends BaseServiceImpl<DailyPractice> implements DailyPracticeService {

    private final DailyPracticeMapper dailyPracticeMapper;

    @Autowired
    public DailyPracticeServiceImpl(DailyPracticeMapper dailyPracticeMapper) {
        super(dailyPracticeMapper);
        this.dailyPracticeMapper = dailyPracticeMapper;
    }

    @Override
    public PageInfo<DailyPractice> page(DailyPracticePageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc").doSelectPageInfo(() ->
                dailyPracticeMapper.page(requestVM)
        );
    }

    @Override
    public void edit(DailyPractice dailyPractice) {
        if (dailyPractice.getId() == null) {
            dailyPracticeMapper.insertSelective(dailyPractice);
        } else {
            dailyPracticeMapper.updateByPrimaryKeySelective(dailyPractice);
        }
    }

    @Override
    public List<DailyPractice> getByGradeLevel(Integer gradeLevel) {
        return dailyPracticeMapper.getByGradeLevel(gradeLevel);
    }
}

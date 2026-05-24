package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.DailyPractice;
import com.mindskip.xzs.viewmodel.admin.dailypractice.DailyPracticePageRequestVM;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DailyPracticeMapper extends BaseMapper<DailyPractice> {

    List<DailyPractice> page(DailyPracticePageRequestVM requestVM);

    List<DailyPractice> getByGradeLevel(@Param("gradeLevel") Integer gradeLevel);
}

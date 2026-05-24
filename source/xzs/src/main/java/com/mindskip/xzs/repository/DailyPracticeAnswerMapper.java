package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.DailyPracticeAnswer;
import com.mindskip.xzs.viewmodel.admin.dailypractice.DailyPracticeAnswerPageRequestVM;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

@Mapper
public interface DailyPracticeAnswerMapper extends BaseMapper<DailyPracticeAnswer> {

    List<DailyPracticeAnswer> page(DailyPracticeAnswerPageRequestVM requestVM);

    DailyPracticeAnswer getByPracticeAndUserAndDate(@Param("dailyPracticeId") Integer dailyPracticeId,
                                                     @Param("userId") Integer userId,
                                                     @Param("practiceDate") Date practiceDate);

    List<DailyPracticeAnswer> getByUserId(@Param("userId") Integer userId);

    List<DailyPracticeAnswer> getByDailyPracticeId(@Param("dailyPracticeId") Integer dailyPracticeId);

    DailyPracticeAnswer getBestByPracticeAndUserAndDate(@Param("dailyPracticeId") Integer dailyPracticeId,
                                                         @Param("userId") Integer userId,
                                                         @Param("practiceDate") Date practiceDate);

    int countByPracticeAndUserAndDate(@Param("dailyPracticeId") Integer dailyPracticeId,
                                      @Param("userId") Integer userId,
                                      @Param("practiceDate") Date practiceDate);

    List<DailyPracticeAnswer> pageByUserId(@Param("userId") Integer userId);

    List<DailyPracticeAnswer> pageBest(DailyPracticeAnswerPageRequestVM requestVM);
}

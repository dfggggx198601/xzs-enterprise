package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.other.KeyValue;
import com.mindskip.xzs.domain.Question;
import com.mindskip.xzs.viewmodel.admin.question.QuestionPageRequestVM;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
import java.util.List;

@Mapper
public interface QuestionMapper extends BaseMapper<Question> {

    List<Question> page(QuestionPageRequestVM requestVM);

    List<Question> selectByIds(@Param("ids") List<Integer> ids);

    Integer selectAllCount();

    List<KeyValue> selectMothCount(@Param("startTime") Date startTime, @Param("endTime") Date endTime);

    List<Question> selectRandomByTag(@Param("subjectId") Integer subjectId, @Param("tag") String tag,
            @Param("questionType") Integer questionType, @Param("count") Integer count);

    List<KeyValue> selectBankList();

    void updateBank(@Param("oldTag") String oldTag, @Param("newTag") String newTag);

    void deleteBank(@Param("tag") String tag);

    List<KeyValue> countByTagGroupByType(@Param("tag") String tag);
}

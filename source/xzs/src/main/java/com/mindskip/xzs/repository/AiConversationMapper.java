package com.mindskip.xzs.repository;

import org.apache.ibatis.annotations.Mapper;
import com.mindskip.xzs.domain.AiConversation;

@Mapper
public interface AiConversationMapper extends BaseMapper<AiConversation> {
    AiConversation selectById(Integer id);

    java.util.List<AiConversation> selectByUserId(Integer userId);

    int updateByIdFilter(AiConversation record);
}

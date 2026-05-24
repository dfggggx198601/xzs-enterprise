package com.mindskip.xzs.repository;

import org.apache.ibatis.annotations.Mapper;
import com.mindskip.xzs.domain.AiMessage;

@Mapper
public interface AiMessageMapper extends BaseMapper<AiMessage> {
    AiMessage selectById(Integer id);

    java.util.List<AiMessage> selectByConversationId(Integer conversationId);

    int updateByIdFilter(AiMessage record);
}

package com.mindskip.xzs.repository;

import org.apache.ibatis.annotations.Mapper;
import com.mindskip.xzs.domain.AiAgent;
import java.util.List;

@Mapper
public interface AiAgentMapper extends BaseMapper<AiAgent> {
    AiAgent selectById(Integer id);

    List<AiAgent> selectByUserId(Integer userId);

    int updateByIdFilter(AiAgent record);
}

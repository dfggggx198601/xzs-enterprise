package com.mindskip.xzs.repository;

import com.mindskip.xzs.domain.BusinessLine;
import com.mindskip.xzs.viewmodel.admin.education.BusinessLinePageRequestVM;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface BusinessLineMapper extends BaseMapper<BusinessLine> {
    List<BusinessLine> page(BusinessLinePageRequestVM requestVM);
    List<BusinessLine> selectAll();
}

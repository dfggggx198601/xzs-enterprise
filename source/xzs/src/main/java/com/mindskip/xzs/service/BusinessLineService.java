package com.mindskip.xzs.service;
import com.mindskip.xzs.domain.BusinessLine;
import com.mindskip.xzs.viewmodel.admin.education.BusinessLinePageRequestVM;
import com.github.pagehelper.PageInfo;
import java.util.List;

public interface BusinessLineService extends BaseService<BusinessLine> {
    PageInfo<BusinessLine> page(BusinessLinePageRequestVM requestVM);
    List<BusinessLine> selectAll();
}

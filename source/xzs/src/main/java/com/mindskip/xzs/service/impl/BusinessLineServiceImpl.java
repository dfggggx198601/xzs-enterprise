package com.mindskip.xzs.service.impl;
import com.mindskip.xzs.domain.BusinessLine;
import com.mindskip.xzs.repository.BusinessLineMapper;
import com.mindskip.xzs.service.BusinessLineService;
import com.mindskip.xzs.viewmodel.admin.education.BusinessLinePageRequestVM;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BusinessLineServiceImpl extends BaseServiceImpl<BusinessLine> implements BusinessLineService {
    private final BusinessLineMapper businessLineMapper;
    @Autowired
    public BusinessLineServiceImpl(BusinessLineMapper businessLineMapper) {
        super(businessLineMapper);
        this.businessLineMapper = businessLineMapper;
    }
    @Override
    public PageInfo<BusinessLine> page(BusinessLinePageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc").doSelectPageInfo(() ->
                businessLineMapper.page(requestVM)
        );
    }
    @Override
    public List<BusinessLine> selectAll() {
        return businessLineMapper.selectAll();
    }
}

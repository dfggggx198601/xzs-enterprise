package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.BusinessLine;
import com.mindskip.xzs.service.BusinessLineService;
import com.mindskip.xzs.viewmodel.admin.education.BusinessLineEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.BusinessLinePageRequestVM;
import com.mindskip.xzs.viewmodel.admin.education.BusinessLineResponseVM;
import com.github.pagehelper.PageInfo;
import com.mindskip.xzs.utility.PageInfoHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;

@RestController("AdminBusinessLineController")
@RequestMapping(value = "/api/admin/education/businessLine")
public class BusinessLineController extends BaseApiController {
    private final BusinessLineService businessLineService;
    @Autowired
    public BusinessLineController(BusinessLineService businessLineService) {
        this.businessLineService = businessLineService;
    }
    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<BusinessLineResponseVM>> page(@RequestBody BusinessLinePageRequestVM model) {
        PageInfo<BusinessLine> pageInfo = businessLineService.page(model);
        PageInfo<BusinessLineResponseVM> page = PageInfoHelper.copyMap(pageInfo, e -> modelMapper.map(e, BusinessLineResponseVM.class));
        return RestResponse.ok(page);
    }
    @RequestMapping(value = "/list", method = RequestMethod.POST)
    public RestResponse<List<BusinessLine>> list() {
        List<BusinessLine> list = businessLineService.selectAll();
        return RestResponse.ok(list);
    }
    @RequestMapping(value = "/edit", method = RequestMethod.POST)
    public RestResponse edit(@RequestBody @Valid BusinessLineEditRequestVM model) {
        BusinessLine businessLine = modelMapper.map(model, BusinessLine.class);
        if (model.getId() == null) {
            businessLine.setDeleted(false);
            businessLineService.insertByFilter(businessLine);
        } else {
            businessLineService.updateByIdFilter(businessLine);
        }
        return RestResponse.ok();
    }
    @RequestMapping(value = "/select/{id}", method = RequestMethod.POST)
    public RestResponse<BusinessLineEditRequestVM> select(@PathVariable Integer id) {
        BusinessLine businessLine = businessLineService.selectById(id);
        BusinessLineEditRequestVM vm = modelMapper.map(businessLine, BusinessLineEditRequestVM.class);
        return RestResponse.ok(vm);
    }
    @RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
    public RestResponse delete(@PathVariable Integer id) {
        BusinessLine businessLine = businessLineService.selectById(id);
        businessLine.setDeleted(true);
        businessLineService.updateByIdFilter(businessLine);
        return RestResponse.ok();
    }
}

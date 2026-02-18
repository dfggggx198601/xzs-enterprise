package com.mindskip.xzs.controller.admin;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.DailyPractice;
import com.mindskip.xzs.domain.DailyPracticeAnswer;
import com.mindskip.xzs.domain.User;
import com.mindskip.xzs.service.DailyPracticeAnswerService;
import com.mindskip.xzs.service.DailyPracticeService;
import com.mindskip.xzs.service.UserService;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.PageInfoHelper;
import com.mindskip.xzs.viewmodel.admin.dailypractice.*;
import com.github.pagehelper.PageInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Date;

@RestController("AdminDailyPracticeController")
@RequestMapping(value = "/api/admin/dailyPractice")
public class DailyPracticeController extends BaseApiController {

    private final DailyPracticeService dailyPracticeService;
    private final DailyPracticeAnswerService dailyPracticeAnswerService;
    private final UserService userService;

    @Autowired
    public DailyPracticeController(DailyPracticeService dailyPracticeService,
                                    DailyPracticeAnswerService dailyPracticeAnswerService,
                                    UserService userService) {
        this.dailyPracticeService = dailyPracticeService;
        this.dailyPracticeAnswerService = dailyPracticeAnswerService;
        this.userService = userService;
    }

    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<DailyPracticePageResponseVM>> pageList(@RequestBody DailyPracticePageRequestVM model) {
        PageInfo<DailyPractice> pageInfo = dailyPracticeService.page(model);
        PageInfo<DailyPracticePageResponseVM> page = PageInfoHelper.copyMap(pageInfo, d -> {
            DailyPracticePageResponseVM vm = modelMapper.map(d, DailyPracticePageResponseVM.class);
            vm.setCreateTime(DateTimeUtil.dateFormat(d.getCreateTime()));
            return vm;
        });
        return RestResponse.ok(page);
    }

    @RequestMapping(value = "/edit", method = RequestMethod.POST)
    public RestResponse edit(@RequestBody @Valid DailyPracticeRequestVM model) {
        DailyPractice dailyPractice = modelMapper.map(model, DailyPractice.class);
        if (model.getId() == null) {
            User user = getCurrentUser();
            dailyPractice.setCreateUser(user.getId());
            dailyPractice.setCreateUserName(user.getUserName());
            dailyPractice.setCreateTime(new Date());
            dailyPractice.setDeleted(false);
            if (dailyPractice.getStatus() == null) {
                dailyPractice.setStatus(1);
            }
        }
        dailyPracticeService.edit(dailyPractice);
        return RestResponse.ok();
    }

    @RequestMapping(value = "/select/{id}", method = RequestMethod.POST)
    public RestResponse<DailyPracticeRequestVM> select(@PathVariable Integer id) {
        DailyPractice dailyPractice = dailyPracticeService.selectById(id);
        DailyPracticeRequestVM vm = modelMapper.map(dailyPractice, DailyPracticeRequestVM.class);
        return RestResponse.ok(vm);
    }

    @RequestMapping(value = "/delete/{id}", method = RequestMethod.POST)
    public RestResponse delete(@PathVariable Integer id) {
        DailyPractice dailyPractice = dailyPracticeService.selectById(id);
        dailyPractice.setDeleted(true);
        dailyPracticeService.updateByIdFilter(dailyPractice);
        return RestResponse.ok();
    }

    @RequestMapping(value = "/answer/page", method = RequestMethod.POST)
    public RestResponse<PageInfo<DailyPracticeAnswerPageResponseVM>> answerPageList(@RequestBody DailyPracticeAnswerPageRequestVM model) {
        PageInfo<DailyPracticeAnswer> pageInfo = dailyPracticeAnswerService.page(model);
        PageInfo<DailyPracticeAnswerPageResponseVM> page = PageInfoHelper.copyMap(pageInfo, d -> {
            DailyPracticeAnswerPageResponseVM vm = modelMapper.map(d, DailyPracticeAnswerPageResponseVM.class);
            vm.setCreateTime(DateTimeUtil.dateFormat(d.getCreateTime()));
            if (d.getPracticeDate() != null) {
                vm.setPracticeDate(DateTimeUtil.dateFormat(d.getPracticeDate()));
            }
            User user = userService.selectById(d.getUserId());
            if (user != null) {
                vm.setUserName(user.getUserName());
            }
            DailyPractice dp = dailyPracticeService.selectById(d.getDailyPracticeId());
            if (dp != null) {
                vm.setDailyPracticeTitle(dp.getTitle());
            }
            return vm;
        });
        return RestResponse.ok(page);
    }
}

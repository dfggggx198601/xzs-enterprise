package com.mindskip.xzs.controller.student;

import com.mindskip.xzs.base.BaseApiController;
import com.mindskip.xzs.base.RestResponse;
import com.mindskip.xzs.domain.AiAgent;
import com.mindskip.xzs.domain.AiConversation;
import com.mindskip.xzs.domain.AiMessage;
import com.mindskip.xzs.service.AiAgentService;
import com.mindskip.xzs.viewmodel.student.ai.AiChatRequestVM;
import com.mindskip.xzs.viewmodel.student.ai.AiChatResponseVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController("StudentAiAgentController")
@RequestMapping(value = "/api/student/agent")
public class AiAgentController extends BaseApiController {

    private final AiAgentService aiAgentService;

    @Autowired
    public AiAgentController(AiAgentService aiAgentService) {
        this.aiAgentService = aiAgentService;
    }

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RestResponse<AiAgent> createAgent(@RequestBody AiAgent agent) {
        agent.setUserId(getCurrentUser().getId());
        AiAgent newAgent = aiAgentService.createAgent(agent);
        return RestResponse.ok(newAgent);
    }

    @RequestMapping(value = "/list", method = RequestMethod.POST)
    public RestResponse<List<AiAgent>> getAgents() {
        Integer userId = getCurrentUser().getId();
        List<AiAgent> list = aiAgentService.getUserAgents(userId);
        return RestResponse.ok(list);
    }

    @RequestMapping(value = "/conversations", method = RequestMethod.POST)
    public RestResponse<List<AiConversation>> getConversations() {
        Integer userId = getCurrentUser().getId();
        List<AiConversation> list = aiAgentService.getUserConversations(userId);
        return RestResponse.ok(list);
    }

    @RequestMapping(value = "/chat", method = RequestMethod.POST)
    public RestResponse<AiChatResponseVM> chat(@RequestBody @Valid AiChatRequestVM request) {
        Integer userId = getCurrentUser().getId();
        AiChatResponseVM response = aiAgentService.chat(request, userId);
        return RestResponse.ok(response);
    }

    @RequestMapping(value = "/history/{conversationId}", method = RequestMethod.POST)
    public RestResponse<List<AiMessage>> history(@PathVariable Integer conversationId) {
        Integer userId = getCurrentUser().getId();
        List<AiMessage> list = aiAgentService.getConversationMessages(conversationId, userId);
        return RestResponse.ok(list);
    }
}

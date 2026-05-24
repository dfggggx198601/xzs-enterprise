package com.mindskip.xzs.service;

import com.mindskip.xzs.domain.AiAgent;
import com.mindskip.xzs.domain.AiConversation;
import com.mindskip.xzs.domain.AiMessage;
import com.mindskip.xzs.viewmodel.student.ai.AiChatRequestVM;
import com.mindskip.xzs.viewmodel.student.ai.AiChatResponseVM;

import java.util.List;

public interface AiAgentService {

    AiAgent createAgent(AiAgent agent);

    AiConversation createConversation(Integer agentId, Integer userId);

    List<AiConversation> getUserConversations(Integer userId);

    List<AiMessage> getConversationMessages(Integer conversationId, Integer userId);

    AiChatResponseVM chat(AiChatRequestVM request, Integer userId);

    AiAgent getAgentById(Integer id);

    List<AiAgent> getUserAgents(Integer userId);
}

package com.mindskip.xzs.service.impl;

import com.github.pagehelper.PageHelper;
import com.mindskip.xzs.domain.AiAgent;
import com.mindskip.xzs.domain.AiConversation;
import com.mindskip.xzs.domain.AiMessage;
import com.mindskip.xzs.repository.AiAgentMapper;
import com.mindskip.xzs.repository.AiConversationMapper;
import com.mindskip.xzs.repository.AiMessageMapper;
import com.mindskip.xzs.service.AiAgentService;
import com.mindskip.xzs.viewmodel.student.ai.AiChatRequestVM;
import com.mindskip.xzs.viewmodel.student.ai.AiChatResponseVM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiAgentServiceImpl implements AiAgentService {

    private final AiAgentMapper aiAgentMapper;
    private final AiConversationMapper aiConversationMapper;
    private final AiMessageMapper aiMessageMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    private final String AI_API_URL = "http://100.83.197.67:8045/v1/chat/completions";
    private final String AI_API_KEY = "Bearer sk-457361277d924b2c8d766341503fcfaf";

    @Autowired
    public AiAgentServiceImpl(AiAgentMapper aiAgentMapper, AiConversationMapper aiConversationMapper,
            AiMessageMapper aiMessageMapper) {
        this.aiAgentMapper = aiAgentMapper;
        this.aiConversationMapper = aiConversationMapper;
        this.aiMessageMapper = aiMessageMapper;
    }

    @Override
    public AiAgent createAgent(AiAgent agent) {
        agent.setCreateTime(new Date());
        agent.setStatus(1);
        aiAgentMapper.insert(agent);
        return agent;
    }

    @Override
    public AiAgent getAgentById(Integer id) {
        return aiAgentMapper.selectById(id);
    }

    @Override
    public List<AiAgent> getUserAgents(Integer userId) {
        return aiAgentMapper.selectByUserId(userId);
    }

    @Override
    public AiConversation createConversation(Integer agentId, Integer userId) {
        AiConversation conversation = new AiConversation();
        conversation.setAgentId(agentId);
        conversation.setUserId(userId);
        conversation.setTitle("新对话");
        Date now = new Date();
        conversation.setCreateTime(now);
        conversation.setUpdateTime(now);
        aiConversationMapper.insert(conversation);
        return conversation;
    }

    @Override
    public List<AiConversation> getUserConversations(Integer userId) {
        return aiConversationMapper.selectByUserId(userId);
    }

    @Override
    public List<AiMessage> getConversationMessages(Integer conversationId, Integer userId) {
        // verify conversation belongs to user if needed
        return aiMessageMapper.selectByConversationId(conversationId);
    }

    @Override
    public AiChatResponseVM chat(AiChatRequestVM request, Integer userId) {
        AiConversation conversation = null;
        if (request.getConversationId() != null) {
            conversation = aiConversationMapper.selectById(request.getConversationId());
        }
        if (conversation == null) {
            conversation = createConversation(request.getAgentId(), userId);
        }

        AiAgent agent = aiAgentMapper.selectById(conversation.getAgentId());
        if (agent == null) {
            throw new RuntimeException("AI微应用不存在");
        }

        // 1. Save User Message
        AiMessage userMsg = new AiMessage();
        userMsg.setConversationId(conversation.getId());
        userMsg.setRole("user");
        userMsg.setContent(request.getContent());
        userMsg.setAttachmentUrl(request.getAttachmentUrl());
        userMsg.setStatus(1);
        userMsg.setCreateTime(new Date());
        aiMessageMapper.insert(userMsg);

        // 2. Build AI Request Context
        List<AiMessage> history = aiMessageMapper.selectByConversationId(conversation.getId());
        List<Map<String, String>> messages = new ArrayList<>();

        if (agent.getSystemPrompt() != null && !agent.getSystemPrompt().isEmpty()) {
            Map<String, String> sysMsg = new HashMap<>();
            sysMsg.put("role", "system");
            sysMsg.put("content", agent.getSystemPrompt());
            messages.add(sysMsg);
        }

        for (AiMessage msg : history) {
            Map<String, String> m = new HashMap<>();
            m.put("role", msg.getRole());
            m.put("content", msg.getContent());
            messages.add(m);
        }

        Map<String, Object> reqBody = new HashMap<>();
        reqBody.put("model", agent.getModel() != null ? agent.getModel() : "gemini-3.1-pro-high");
        reqBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", AI_API_KEY);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(reqBody, headers);

        // 3. Call AI API
        String aiResponseText = "";
        try {
            Map<String, Object> response = restTemplate.postForObject(AI_API_URL, entity, Map.class);
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> messageMap = (Map<String, Object>) choices.get(0).get("message");
                    if (messageMap != null && messageMap.containsKey("content")) {
                        aiResponseText = (String) messageMap.get("content");
                    }
                }
            }
        } catch (Exception e) {
            aiResponseText = "对不起，大模型服务响应超时或出错: " + e.getMessage();
        }

        // 4. Save AI Response
        AiMessage aiMsg = new AiMessage();
        aiMsg.setConversationId(conversation.getId());
        aiMsg.setRole("assistant");
        aiMsg.setContent(aiResponseText);
        aiMsg.setStatus(1);
        aiMsg.setCreateTime(new Date());
        aiMessageMapper.insert(aiMsg);

        // Update conversation time
        conversation.setUpdateTime(new Date());
        aiConversationMapper.updateByIdFilter(conversation);

        // 5. Return result
        AiChatResponseVM res = new AiChatResponseVM();
        res.setMessageId(aiMsg.getId());
        res.setConversationId(conversation.getId());
        res.setRole(aiMsg.getRole());
        res.setContent(aiMsg.getContent());
        res.setCreateTime(aiMsg.getCreateTime());

        return res;
    }
}

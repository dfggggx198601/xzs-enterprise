package com.mindskip.xzs.viewmodel.student.ai;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class AiChatRequestVM {

    @NotNull
    private Integer agentId;

    private Integer conversationId;

    @NotBlank
    private String content;

    private String attachmentUrl;

    public Integer getAgentId() {
        return agentId;
    }

    public void setAgentId(Integer agentId) {
        this.agentId = agentId;
    }

    public Integer getConversationId() {
        return conversationId;
    }

    public void setConversationId(Integer conversationId) {
        this.conversationId = conversationId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }
}

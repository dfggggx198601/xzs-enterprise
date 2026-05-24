<template>
  <div class="agent-container">
    <el-row class="chat-wrapper">
      <el-col :span="18" :offset="3" class="chat-inner" v-if="!isRuntime">
        <el-card class="chat-card" shadow="hover">
          <div slot="header" class="clearfix">
            <span style="font-weight: 600; font-size: 16px;">{{ agentName }}</span>
            <el-tag size="small" type="success" style="float: right;">Gemini 3.1 Pro</el-tag>
          </div>

          <div class="message-list" id="msgList">
            <div class="system-tip" v-if="!isRuntime">由 Gemini 强力驱动微应用工坊，输入您的需求开始创建。</div>

            <div v-for="(msg, index) in messages" :key="index" :class="['message-row', msg.role === 'user' ? 'user-row' : 'bot-row']">
              <div v-if="msg.role !== 'user'" class="avatar bot-avatar">
                <i class="el-icon-service"></i>
              </div>

              <div class="msg-content-wrapper">
                <div v-if="msg.displayContent" :class="['msg-bubble', msg.role === 'user' ? 'user-bubble' : 'bot-bubble']">
                  {{ msg.displayContent }}
                </div>

                <div v-if="msg.appConfig" class="app-card">
                  <div class="app-card-header">
                    <div class="app-icon"><i class="el-icon-monitor"></i></div>
                    <div class="app-title">{{ msg.appConfig.name }}</div>
                  </div>
                  <div class="app-desc">{{ msg.appConfig.description }}</div>
                  <div class="app-prompt-box">
                    <div class="prompt-label">预设系统提示词</div>
                    <div class="prompt-text">{{ msg.appConfig.systemPrompt }}</div>
                  </div>
                  <el-button type="primary" size="small" style="width: 100%; margin-top: 10px;"
                             :loading="creatingApp" @click="handleCreateApp(msg.appConfig)">
                    🚀 一键发布此应用
                  </el-button>
                </div>
              </div>

              <div v-if="msg.role === 'user'" class="avatar user-avatar">
                <i class="el-icon-user-solid"></i>
              </div>
            </div>

            <div v-if="loading" class="message-row bot-row">
              <div class="avatar bot-avatar"><i class="el-icon-loading"></i></div>
              <div class="msg-bubble bot-bubble">正在思考...</div>
            </div>
          </div>

          <div class="input-area">
            <el-input
              type="textarea"
              :rows="3"
              :placeholder="isRuntime ? '请在此输入您的消息...' : '告诉向导您的想法（例如：帮我做一个小红书爆款文案助手）...'"
              v-model="inputText"
              @keyup.enter.native="handleSend"
              :disabled="loading || agentId === null"
            >
            </el-input>
            <div class="send-btn-wrap">
              <el-button type="primary" icon="el-icon-s-promotion" :loading="loading"
                         :disabled="!inputText.trim() || agentId === null" @click="handleSend">
                发送
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16" :offset="4" v-else>
        <el-card shadow="hover" style="border-radius: 12px; margin-top: 20px;">
          <div style="text-align: center; margin-bottom: 20px; padding-top: 10px;">
            <div style="font-size: 50px; color: #409EFF; margin-bottom: 15px;"><i class="el-icon-cpu"></i></div>
            <h2 style="margin: 0 0 10px 0; color: #303133;">{{ agentName }}</h2>
            <p style="color: #909399; margin: 0; font-size: 14px;">{{ agentDesc }}</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-weight: 600; font-size: 15px; margin-bottom: 12px; color: #303133; display: flex; justify-content: space-between; align-items: center;">
              <span>工作流输入区 (粘贴或提取待处理素材)</span>
              <div>
                <el-upload
                  action=""
                  :multiple="false"
                  :show-file-list="false"
                  :http-request="handleFileUpload"
                  accept=".txt,.docx"
                  style="display: inline-block; margin-right: 10px;"
                >
                  <el-button size="small" type="success" plain icon="el-icon-document-add">提取文档内容</el-button>
                </el-upload>
                <el-upload
                  action=""
                  :multiple="false"
                  :show-file-list="false"
                  :http-request="handleTemplateUpload"
                  accept=".docx"
                  style="display: inline-block;"
                >
                  <el-button size="small" type="primary" plain icon="el-icon-upload">上传格式模板 (.docx)</el-button>
                </el-upload>
              </div>
            </div>
            
            <div v-if="templateFileName" style="margin-bottom: 15px; padding: 10px; background: #eef2f9; border-radius: 6px; border: 1px dashed #409eff;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; color: #409eff;">
                  <i class="el-icon-document"></i> 已选定输出目标模板：<b>{{ templateFileName }}</b>
                </span>
                <el-button type="text" style="color: #f56c6c; padding: 0;" @click="removeTemplate">移除模板</el-button>
              </div>
              <div style="margin-top: 5px; font-size: 12px; color: #606266;">
                模板中需替换的占位符变量：<el-tag size="mini" type="info" style="margin-right: 5px;" v-for="tag in templateTags" :key="tag">{{ tag }}</el-tag>
                <span v-if="templateTags.length === 0" style="color: #e6a23c;"><i class="el-icon-warning"></i> 未检测到模板中的花括号 {标签}！请在模板中使用形如 {姓名} 代替空白处。</span>
              </div>
            </div>
            <el-input
              type="textarea"
              :rows="8"
              placeholder="请详细提供被处理素材或执行步骤要求（支持长文本粘贴）..."
              v-model="inputText"
            ></el-input>
            <div style="text-align: right; margin-top: 15px;">
              <el-button type="primary" style="padding: 12px 25px;" @click="handleRunApp" :loading="loading">
                <i class="el-icon-magic-stick" v-if="!loading"></i> 开始执行工作流
              </el-button>
            </div>
          </div>
          <div v-if="loading" style="border-top: 1px solid #ebeef5; padding-top: 20px;">
             <div style="font-weight: 600; font-size: 15px; margin-bottom: 12px; color: #303133;">执行状态</div>
             <div v-loading="loading" element-loading-text="正在为您解析并生成文档下载..." style="min-height: 100px; background: #fff; border: 1px dashed #409eff; padding: 15px; border-radius: 8px;"></div>
          </div>
          <div v-else-if="appResult" style="border-top: 1px solid #ebeef5; padding-top: 20px;">
             <div style="font-weight: 600; font-size: 15px; margin-bottom: 12px; color: #E6A23C;"><i class="el-icon-warning"></i> 文档生成异常，退回为纯文本结果：</div>
             <div style="min-height: 100px; background: #fff; border: 1px solid #e4e7ed; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap;">{{ appResult }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import agentApi from '@/api/agent'
import * as mammoth from 'mammoth'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'

export default {
  name: 'AgentBuilder',
  data () {
    return {
      messages: [],
      inputText: '',
      loading: false,
      agentId: null,
      conversationId: null,
      creatingApp: false,
      isRuntime: false,
      agentName: '微应用开发向导',
      agentDesc: '',
      appResult: '',
      templateFileBuffer: null,
      templateFileName: '',
      templateTags: []
    }
  },
  mounted () {
    if (this.$route.query.id) {
      this.isRuntime = true
      this.agentId = this.$route.query.id
      this.agentName = this.$route.query.name || '微应用对话'
      this.agentDesc = this.$route.query.desc || '专属智能工作流助手'
    } else {
      this.initAgent()
    }
  },
  methods: {
    scrollToBottom () {
      this.$nextTick(() => {
        const list = document.getElementById('msgList')
        if (list) {
          list.scrollTop = list.scrollHeight
        }
      })
    },
    async initAgent () {
      try {
        const res = await agentApi.create({
          name: '微应用开发向导 (Web)',
          description: '通过聊天帮您创造专属AI应用',
          systemPrompt: '你是一个AI微应用开发专家。你的任务是通过连续的对话，帮助用户梳理并创建一个专属的AI微应用（Agent）。\n请依次向用户提问，引导他们明确这个微应用的：\n1. 名字 (name)\n2. 一句话介绍 (description)\n3. 详细的行为设定、身份、专业知识和语气 (systemPrompt)\n\n在对话过程中，表现得专业、热情。当且仅当你收集齐了所有的信息，请在你回复的最后，附加上以下JSON格式的内容（必须严格被包裹在 ```json 和 ``` 之间，并且只有在确认好内容后才输出）：\n```json\n{\n  "action": "create_agent",\n  "name": "应用的名字",\n  "description": "一句话介绍",\n  "systemPrompt": "你整理好的微应用系统提示词，要非常详细"\n}\n```\n不要过早输出JSON。'
        })
        if (res.code === 1) {
          this.agentId = res.response.id
          this.pushMessage({
            id: Date.now(),
            role: 'assistant',
            content: '您好！我是您的微应用开发向导。告诉我，您今天想做一个什么样的 AI 应用？例如：英语口语陪练、小红书文案助手、或者专业的生活管家。'
          })
        }
      } catch (e) {
        this.$message.error('无法初始化向导: ' + e.message)
      }
    },
    async loadHistory () {
      this.loading = true
      try {
        const res = await agentApi.history(this.agentId)
        if (res.code === 1 && res.response && res.response.length > 0) {
          const list = res.response
          this.conversationId = list[0].conversationId
          list.forEach(msg => {
            if (msg.role !== 'system') {
              this.pushMessage({
                id: msg.id,
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
              })
            }
          })
        }
        if (this.messages.length === 0) {
          this.pushMessage({
            id: Date.now(),
            role: 'assistant',
            content: '您好！我是您的专属微应用助手，很高兴为您服务。'
          })
        }
      } catch (e) {
        this.$message.error('加载历史记录失败: ' + e.message)
      } finally {
        this.loading = false
      }
    },
    pushMessage (msg) {
      let displayContent = msg.content || ''
      let appConfig = null

      if (msg.role === 'assistant') {
        const jsonMatch = displayContent.match(/```(?:json)?\n([\s\S]*?)\n```/)
        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsed = JSON.parse(jsonMatch[1])
            if (parsed.action === 'create_agent') {
              appConfig = parsed
              displayContent = displayContent.replace(jsonMatch[0], '').trim()
            }
          } catch (e) {
            console.warn('JSON Parse Error', e)
          }
        }
      }

      this.messages.push({
        ...msg,
        displayContent,
        appConfig
      })
      this.scrollToBottom()
    },
    async handleSend (e) {
      if (e && e.shiftKey) return // Allow Shift+Enter for newlines
      if (e) e.preventDefault()

      const userMsg = this.inputText.trim()
      if (!userMsg || !this.agentId || this.loading) return

      this.inputText = ''
      this.pushMessage({ id: Date.now(), role: 'user', content: userMsg })
      this.loading = true

      try {
        const res = await agentApi.chat({
          agentId: this.agentId,
          conversationId: this.conversationId,
          content: userMsg
        })

        if (res.code === 1) {
          if (!this.conversationId && res.response.conversationId) {
            this.conversationId = res.response.conversationId
          }
          this.pushMessage({
            id: res.response.messageId,
            role: res.response.role || 'assistant',
            content: res.response.content
          })
        } else {
          this.$message.error(res.message)
        }
      } catch (e) {
        this.$message.error('请求超时或失败')
      } finally {
        this.loading = false
        this.scrollToBottom()
      }
    },
    async handleCreateApp (appConfig) {
      this.creatingApp = true
      try {
        const res = await agentApi.create({
          name: appConfig.name,
          description: appConfig.description,
          systemPrompt: appConfig.systemPrompt
        })
        if (res.code === 1) {
          this.$notify({
            title: '🎉 部署成功',
            message: `您的微应用【${appConfig.name}】已成功发布！您可以在移动端看到它。`,
            type: 'success',
            duration: 5000
          })
          this.pushMessage({
            id: Date.now(),
            role: 'assistant',
            content: `✨ 应用【${appConfig.name}】发布成功！您可以随时继续跟我对话创建更多应用。`
          })
        } else {
          this.$message.error(res.message)
        }
      } catch (e) {
        this.$message.error('部署失败: ' + e.message)
      } finally {
        this.creatingApp = false
        this.scrollToBottom()
      }
    },
    async handleRunApp () {
      const userMsg = this.inputText.trim()
      if (!userMsg || !this.agentId || this.loading) return

      this.loading = true
      this.appResult = ''
      
      let promptText = userMsg
      if (this.templateFileBuffer && this.templateTags.length > 0) {
        promptText += `\n\n【系统强制指令】\n分析上述素材，提取以下模板变量：${this.templateTags.join(', ')}。\n所有字段请严格输出为一个JSON格式对象（键为变量名，值为提取内容），不要输出除了 JSON 之外的任何描述文本！`
      }

      try {
        const res = await agentApi.chat({
          agentId: this.agentId,
          content: promptText
        })
        if (res.code === 1) {
          let aiText = res.response.content
          
          if (this.templateFileBuffer) {
            try {
              const jsonMatch = aiText.match(/```(?:json)?\n?([\s\S]*?)\n?```/)
              let jsonStr = jsonMatch ? jsonMatch[1].trim() : aiText.trim()
              if (jsonStr.startsWith('{') && jsonStr.endsWith('}')) {
                 // Try to strip any remaining markdown if any
                 if (jsonStr.indexOf('```') !== -1) {
                     jsonStr = jsonStr.replace(/```/g, '')
                 }
                 const extractedData = JSON.parse(jsonStr)
                 const zip = new PizZip(this.templateFileBuffer)
                 const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
                 doc.render(extractedData)
                 const out = doc.getZip().generate({
                   type: 'blob',
                   mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                 })
                 saveAs(out, `生成结果_${this.templateFileName}`)
                 this.$message.success('处理完毕！已自动合并且启动生成的 Word 文档下载！')
                 return // fully succeeded, skip fallback
              } else {
                 this.$message.warning('格式错误：解析模板数据失败，为您导出无格式文档！')
                 // fallback to plain document
              }
            } catch (err) {
               this.$message.warning('模板插值错误，为您导出无格式文档！')
            }
          }
          
          // Fallback / No Template Output: Generate a simple .doc file containing the result text
          const htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>输出结果</title></head><body>" + aiText.replace(/\n/g, '<br/>') + "</body></html>";
          const blob = new Blob(['\ufeff', htmlContent], {
              type: 'application/msword'
          });
          saveAs(blob, `${this.agentName}_结果.doc`);
          this.$message.success(`处理完毕！已直接导出 ${this.agentName}_结果 文件，请查收！`)

        } else {
          this.$message.error(res.message)
          this.appResult = res.message
        }
      } catch (e) {
        this.$message.error('执行超时或失败')
        this.appResult = '服务连接异常，请重试'
      } finally {
        this.loading = false
      }
    },
    removeTemplate () {
      this.templateFileBuffer = null
      this.templateFileName = ''
      this.templateTags = []
    },
    async handleTemplateUpload (params) {
      const file = params.file
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target.result
          const zip = new PizZip(content)
          const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
          const text = doc.getFullText()
          const matches = text.match(/\{[^{}]+\}/g) || []
          const tags = [...new Set(matches.map(t => t.replace(/[{}]/g, '')))]
          
          this.templateFileBuffer = content
          this.templateFileName = file.name
          this.templateTags = tags
          this.$message.success('文档模板已加载并提取占位符！')
        } catch (err) {
          this.$message.error('模板解析失败：这不是一个有效的带占位符的 DOCX 文档格式。')
        }
      }
      reader.onerror = () => this.$message.error('读取文档模板出错！')
      reader.readAsArrayBuffer(file)
    },
    async handleFileUpload (params) {
      const file = params.file
      if (!file) return
      
      this.loading = true
      try {
        if (file.name.endsWith('.docx')) {
          const reader = new FileReader()
          reader.onload = async (e) => {
            const arrayBuffer = e.target.result
            try {
              const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer })
              const text = result.value
              this.inputText += (this.inputText ? '\n\n' : '') + text
              this.$message.success(`成功提取 ${file.name} 内容，已追加至输入框`)
            } catch (err) {
              this.$message.error(`解析 Word 文档失败: ${err.message}`)
            } finally {
              this.loading = false
            }
          }
          reader.onerror = () => {
            this.$message.error('文件读取出错')
            this.loading = false
          }
          reader.readAsArrayBuffer(file)
        } else {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.inputText += (this.inputText ? '\n\n' : '') + e.target.result
            this.$message.success(`成功提取 ${file.name} 内容，已追加至输入框`)
            this.loading = false
          }
          reader.onerror = () => {
             this.$message.error('文件读取出错')
             this.loading = false
          }
          reader.readAsText(file)
        }
      } catch (e) {
        this.loading = false
        this.$message.error('处理文件时出错')
      }
    }
  }
}
</script>

<style scoped>
.agent-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 84px);
}
.chat-wrapper {
  height: 100%;
}
.chat-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}
.chat-card /deep/ .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f9f9f9;
}
.system-tip {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 20px;
}
.message-row {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}
.user-row {
  justify-content: flex-end;
}
.bot-row {
  justify-content: flex-start;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  flex-shrink: 0;
}
.user-avatar {
  background-color: #4A6CF7;
  margin-left: 12px;
}
.bot-avatar {
  background-color: #ffab00;
  margin-right: 12px;
}
.msg-content-wrapper {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}
.msg-bubble {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}
.user-bubble {
  background-color: #4A6CF7;
  color: #fff;
  border-top-right-radius: 0;
}
.bot-bubble {
  background-color: #fff;
  color: #333;
  border: 1px solid #ebeef5;
  border-top-left-radius: 0;
}
.input-area {
  padding: 15px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  position: relative;
}
.send-btn-wrap {
  text-align: right;
  margin-top: 10px;
}
/* App Card Styles */
.app-card {
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
.app-card-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.app-icon {
  width: 32px;
  height: 32px;
  background: rgba(74, 108, 247, 0.1);
  color: #4A6CF7;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 10px;
}
.app-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.app-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 15px;
}
.app-prompt-box {
  background: #f4f6f8;
  padding: 10px;
  border-radius: 6px;
}
.prompt-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
  font-weight: 500;
}
.prompt-text {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  font-style: italic;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

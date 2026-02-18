package com.mindskip.xzs.service.impl;

import com.mindskip.xzs.domain.other.KeyValue;
import com.mindskip.xzs.domain.Question;
import com.mindskip.xzs.domain.TextContent;
import com.mindskip.xzs.domain.enums.QuestionStatusEnum;
import com.mindskip.xzs.domain.enums.QuestionTypeEnum;
import com.mindskip.xzs.domain.other.KeyValue;
import com.mindskip.xzs.domain.question.QuestionItemObject;
import com.mindskip.xzs.domain.question.QuestionObject;
import com.mindskip.xzs.repository.QuestionMapper;
import com.mindskip.xzs.service.QuestionService;
import com.mindskip.xzs.service.SubjectService;
import com.mindskip.xzs.service.TextContentService;
import com.mindskip.xzs.utility.DateTimeUtil;
import com.mindskip.xzs.utility.JsonUtil;
import com.mindskip.xzs.utility.ModelMapperSingle;
import com.mindskip.xzs.utility.ExamUtil;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditItemVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionEditRequestVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionImportVM;
import com.mindskip.xzs.viewmodel.admin.question.QuestionPageRequestVM;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class QuestionServiceImpl extends BaseServiceImpl<Question> implements QuestionService {

    protected final static ModelMapper modelMapper = ModelMapperSingle.Instance();
    private final QuestionMapper questionMapper;
    private final TextContentService textContentService;
    private final SubjectService subjectService;

    @Autowired
    public QuestionServiceImpl(QuestionMapper questionMapper, TextContentService textContentService,
            SubjectService subjectService) {
        super(questionMapper);
        this.textContentService = textContentService;
        this.questionMapper = questionMapper;
        this.subjectService = subjectService;
    }

    @Override
    public PageInfo<Question> page(QuestionPageRequestVM requestVM) {
        return PageHelper.startPage(requestVM.getPageIndex(), requestVM.getPageSize(), "id desc")
                .doSelectPageInfo(() -> questionMapper.page(requestVM));
    }

    @Override
    @Transactional
    public Question insertFullQuestion(QuestionEditRequestVM model, Integer userId) {
        Date now = new Date();
        Integer gradeLevel = subjectService.levelBySubjectId(model.getSubjectId());

        // 题干、解析、选项等 插入
        TextContent infoTextContent = new TextContent();
        infoTextContent.setCreateTime(now);
        setQuestionInfoFromVM(infoTextContent, model);
        textContentService.insertByFilter(infoTextContent);

        Question question = new Question();
        question.setSubjectId(model.getSubjectId());
        question.setGradeLevel(gradeLevel);
        question.setCreateTime(now);
        question.setQuestionType(model.getQuestionType());
        question.setStatus(QuestionStatusEnum.OK.getCode());
        question.setCorrectFromVM(model.getCorrect(), model.getCorrectArray());
        question.setScore(ExamUtil.scoreFromVM(model.getScore()));
        question.setDifficult(model.getDifficult());
        question.setInfoTextContentId(infoTextContent.getId());
        question.setCreateUser(userId);
        question.setDeleted(false);
        question.setTag(model.getTag());
        questionMapper.insertSelective(question);
        return question;
    }

    @Override
    @Transactional
    public Question updateFullQuestion(QuestionEditRequestVM model) {
        Integer gradeLevel = subjectService.levelBySubjectId(model.getSubjectId());
        Question question = questionMapper.selectByPrimaryKey(model.getId());
        question.setSubjectId(model.getSubjectId());
        question.setGradeLevel(gradeLevel);
        question.setScore(ExamUtil.scoreFromVM(model.getScore()));
        question.setDifficult(model.getDifficult());
        question.setCorrectFromVM(model.getCorrect(), model.getCorrectArray());
        questionMapper.updateByPrimaryKeySelective(question);

        // 题干、解析、选项等 更新
        TextContent infoTextContent = textContentService.selectById(question.getInfoTextContentId());
        setQuestionInfoFromVM(infoTextContent, model);
        textContentService.updateByIdFilter(infoTextContent);

        return question;
    }

    @Override
    public QuestionEditRequestVM getQuestionEditRequestVM(Integer questionId) {
        // 题目映射
        Question question = questionMapper.selectByPrimaryKey(questionId);
        return getQuestionEditRequestVM(question);
    }

    @Override
    public QuestionEditRequestVM getQuestionEditRequestVM(Question question) {
        // 题目映射
        TextContent questionInfoTextContent = textContentService.selectById(question.getInfoTextContentId());
        QuestionObject questionObject = JsonUtil.toJsonObject(questionInfoTextContent.getContent(),
                QuestionObject.class);
        QuestionEditRequestVM questionEditRequestVM = modelMapper.map(question, QuestionEditRequestVM.class);
        questionEditRequestVM.setTitle(questionObject.getTitleContent());

        // 答案
        QuestionTypeEnum questionTypeEnum = QuestionTypeEnum.fromCode(question.getQuestionType());
        switch (questionTypeEnum) {
            case SingleChoice:
            case TrueFalse:
                questionEditRequestVM.setCorrect(question.getCorrect());
                break;
            case MultipleChoice:
                questionEditRequestVM.setCorrectArray(ExamUtil.contentToArray(question.getCorrect()));
                break;
            case GapFilling:
                List<String> correctContent = questionObject.getQuestionItemObjects().stream().map(d -> d.getContent())
                        .collect(Collectors.toList());
                questionEditRequestVM.setCorrectArray(correctContent);
                break;
            case ShortAnswer:
                questionEditRequestVM.setCorrect(questionObject.getCorrect());
                break;
            default:
                break;
        }
        questionEditRequestVM.setScore(ExamUtil.scoreToVM(question.getScore()));
        questionEditRequestVM.setAnalyze(questionObject.getAnalyze());

        // 题目项映射
        List<QuestionEditItemVM> editItems = questionObject.getQuestionItemObjects().stream().map(o -> {
            QuestionEditItemVM questionEditItemVM = modelMapper.map(o, QuestionEditItemVM.class);
            if (o.getScore() != null) {
                questionEditItemVM.setScore(ExamUtil.scoreToVM(o.getScore()));
            }
            return questionEditItemVM;
        }).collect(Collectors.toList());
        questionEditRequestVM.setItems(editItems);
        return questionEditRequestVM;
    }

    public void setQuestionInfoFromVM(TextContent infoTextContent, QuestionEditRequestVM model) {
        List<QuestionItemObject> itemObjects = model.getItems().stream().map(i -> {
            QuestionItemObject item = new QuestionItemObject();
            item.setPrefix(i.getPrefix());
            item.setContent(i.getContent());
            item.setItemUuid(i.getItemUuid());
            item.setScore(ExamUtil.scoreFromVM(i.getScore()));
            return item;
        }).collect(Collectors.toList());
        QuestionObject questionObject = new QuestionObject();
        questionObject.setQuestionItemObjects(itemObjects);
        questionObject.setAnalyze(model.getAnalyze());
        questionObject.setTitleContent(model.getTitle());
        questionObject.setCorrect(model.getCorrect());
        infoTextContent.setContent(JsonUtil.toJsonStr(questionObject));
    }

    @Override
    public Integer selectAllCount() {
        return questionMapper.selectAllCount();
    }

    @Override
    public List<Integer> selectMothCount() {
        Date startTime = DateTimeUtil.getMonthStartDay();
        Date endTime = DateTimeUtil.getMonthEndDay();
        List<String> mothStartToNowFormat = DateTimeUtil.MothStartToNowFormat();
        List<KeyValue> mouthCount = questionMapper.selectMothCount(startTime, endTime);
        return mothStartToNowFormat.stream().map(md -> {
            KeyValue keyValue = mouthCount.stream().filter(kv -> kv.getName().equals(md)).findAny().orElse(null);
            return null == keyValue ? 0 : Integer.valueOf(keyValue.getValue().toString());
        }).collect(Collectors.toList());
    }

    @Override
    public List<Question> selectRandomByTag(Integer subjectId, String tag, Integer questionType, Integer count) {
        return questionMapper.selectRandomByTag(subjectId, tag, questionType, count);
    }

    @Override
    public List<KeyValue> selectBankList() {
        return questionMapper.selectBankList();
    }

    @Override
    public void updateBank(String oldTag, String newTag) {
        questionMapper.updateBank(oldTag, newTag);
    }

    @Override
    public void deleteBank(String tag) {
        questionMapper.deleteBank(tag);
    }

    @Override
    @Transactional
    public int importQuestions(List<QuestionImportVM> importList, Integer subjectId, String tag, Integer userId) {
        Integer gradeLevel = subjectService.levelBySubjectId(subjectId);
        int successCount = 0;
        for (QuestionImportVM row : importList) {
            if (row.getTitle() == null || row.getTitle().trim().isEmpty()) {
                continue;
            }

            Integer questionType = parseQuestionType(row.getQuestionType());
            if (questionType == null) {
                continue;
            }

            QuestionEditRequestVM model = new QuestionEditRequestVM();
            model.setQuestionType(questionType);
            model.setSubjectId(subjectId);
            model.setTitle(row.getTitle().trim());
            model.setTag(tag);
            model.setAnalyze(row.getAnalyze() != null ? row.getAnalyze().trim() : "无");
            model.setDifficult(row.getDifficult() != null ? row.getDifficult() : 3);
            model.setScore(row.getScore() != null ? row.getScore().trim() : "5");

            List<QuestionEditItemVM> items = new ArrayList<>();
            if (questionType == QuestionTypeEnum.SingleChoice.getCode()
                    || questionType == QuestionTypeEnum.MultipleChoice.getCode()) {
                addOptionItem(items, "A", row.getOptionA());
                addOptionItem(items, "B", row.getOptionB());
                addOptionItem(items, "C", row.getOptionC());
                addOptionItem(items, "D", row.getOptionD());
            } else if (questionType == QuestionTypeEnum.TrueFalse.getCode()) {
                addOptionItem(items, "A", "正确");
                addOptionItem(items, "B", "错误");
            }
            model.setItems(items);

            String answer = row.getAnswer() != null ? row.getAnswer().trim().toUpperCase() : "";
            if (questionType == QuestionTypeEnum.SingleChoice.getCode()
                    || questionType == QuestionTypeEnum.TrueFalse.getCode()) {
                model.setCorrect(answer);
            } else if (questionType == QuestionTypeEnum.MultipleChoice.getCode()) {
                List<String> correctArray = new ArrayList<>();
                for (char c : answer.toCharArray()) {
                    if (c >= 'A' && c <= 'D') {
                        correctArray.add(String.valueOf(c));
                    }
                }
                model.setCorrectArray(correctArray);
            } else if (questionType == QuestionTypeEnum.GapFilling.getCode()) {
                String[] fills = answer.split("[,，;；]");
                items.clear();
                int perScore = ExamUtil.scoreFromVM(model.getScore()) / Math.max(fills.length, 1);
                for (int i = 0; i < fills.length; i++) {
                    QuestionEditItemVM item = new QuestionEditItemVM();
                    item.setPrefix(String.valueOf(i + 1));
                    item.setContent(fills[i].trim());
                    item.setScore(ExamUtil.scoreToVM(perScore));
                    item.setItemUuid(UUID.randomUUID().toString());
                    items.add(item);
                }
                model.setItems(items);
                model.setScore(ExamUtil.scoreToVM(perScore * fills.length));
            } else if (questionType == QuestionTypeEnum.ShortAnswer.getCode()) {
                model.setCorrect(answer);
                if (items.isEmpty()) {
                    QuestionEditItemVM item = new QuestionEditItemVM();
                    item.setPrefix("");
                    item.setContent("");
                    item.setItemUuid(UUID.randomUUID().toString());
                    items.add(item);
                    model.setItems(items);
                }
            }

            insertFullQuestion(model, userId);
            successCount++;
        }
        return successCount;
    }

    private Integer parseQuestionType(String typeStr) {
        if (typeStr == null) return null;
        typeStr = typeStr.trim();
        switch (typeStr) {
            case "单选题":
            case "单选":
            case "1":
                return QuestionTypeEnum.SingleChoice.getCode();
            case "多选题":
            case "多选":
            case "2":
                return QuestionTypeEnum.MultipleChoice.getCode();
            case "判断题":
            case "判断":
            case "3":
                return QuestionTypeEnum.TrueFalse.getCode();
            case "填空题":
            case "填空":
            case "4":
                return QuestionTypeEnum.GapFilling.getCode();
            case "简答题":
            case "简答":
            case "5":
                return QuestionTypeEnum.ShortAnswer.getCode();
            default:
                return null;
        }
    }

    private void addOptionItem(List<QuestionEditItemVM> items, String prefix, String content) {
        QuestionEditItemVM item = new QuestionEditItemVM();
        item.setPrefix(prefix);
        item.setContent(content != null ? content.trim() : "");
        item.setItemUuid(UUID.randomUUID().toString());
        items.add(item);
    }
}

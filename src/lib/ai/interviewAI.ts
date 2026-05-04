import {
  InterviewConfig,
  AnswerAnalysis,
  InterviewReview,
  TranscriptAnalysis,
} from "../types";

// ============================================================
// AI Provider Interface
// ============================================================
export interface AIProvider {
  generateInterviewQuestion(config: InterviewConfig, history: string[]): Promise<string>;
  analyzeAnswer(question: string, answer: string): Promise<AnswerAnalysis>;
  generateFollowUpQuestion(question: string, answer: string, analysis: AnswerAnalysis): Promise<string>;
  generateInterviewReview(history: { question: string; answer: string; analysis: AnswerAnalysis }[]): Promise<InterviewReview>;
  analyzeTranscript(text: string): Promise<TranscriptAnalysis[]>;
}

// ============================================================
// Mock AI Provider (Default for MVP)
// TODO: Replace mockAIProvider with Tencent Hunyuan / CodeBuddy built-in model API
// ============================================================
class MockAIProvider implements AIProvider {
  private jobDirectionQuestions: Record<string, string[]> = {
    "产品体验设计": [
      "请介绍一个你主导的产品体验优化项目，当时遇到了什么问题，你是如何分析并解决的？",
      "如何平衡用户体验和商业目标之间的冲突？请举例说明。",
      "你认为什么是好的产品体验？请结合你过往的项目经验来说明。",
      "在做设计决策时，如果数据反馈和用户体验原则产生矛盾，你会怎么处理？",
    ],
    "交互设计": [
      "请介绍一个复杂的交互设计案例，你是如何梳理信息架构和交互流程的？",
      "如何评估一个交互方案的好坏？你常用的方法有哪些？",
      "在多端设计中，如何保证交互体验的一致性？",
      "请描述一个你通过微交互提升用户体验的案例。",
    ],
    "UX设计": [
      "请分享一个你通过用户研究驱动设计决策的案例。",
      "你是如何构建用户画像和使用场景的？",
      "在资源有限的情况下，你会如何开展UX研究？",
      "如何向没有设计背景的stakeholder证明UX的价值？",
    ],
    "B端产品设计": [
      "B端产品和C端产品在体验设计上有哪些本质区别？",
      "请介绍一个你设计的B端产品，如何平衡功能复杂度和易用性？",
      "在做B端产品时，你如何理解和梳理复杂的业务逻辑？",
      "如何设计一个高效的B端工作流？请结合案例说明。",
    ],
    "云产品设计": [
      "云产品的用户通常有哪些核心痛点？你在设计中是如何解决的？",
      "如何降低云产品的技术门槛，提升易用性？",
      "请分享一个你在云产品设计中处理复杂配置场景的经验。",
    ],
    "商家侧产品设计": [
      "商家侧产品的用户和C端用户有什么本质不同？",
      "如何设计一个能帮助商家提升经营效率的产品？",
      "请分享一个你通过设计帮助商家提升核心指标的案例。",
    ],
    "电商体验设计": [
      "电商场景中有哪些关键的体验节点？你是如何设计的？",
      "如何提升用户的购买转化率？请分享你的设计思路。",
      "在电商设计中，如何平衡促销氛围和用户体验？",
    ],
  };

  private getQuestions(direction: string): string[] {
    return this.jobDirectionQuestions[direction] || this.jobDirectionQuestions["产品体验设计"];
  }

  async generateInterviewQuestion(config: InterviewConfig, history: string[]): Promise<string> {
    await this.delay(800);
    const questions = this.getQuestions(config.jobDirection);
    const unused = questions.filter((q) => !history.includes(q));
    const pool = unused.length > 0 ? unused : questions;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  async analyzeAnswer(question: string, answer: string): Promise<AnswerAnalysis> {
    await this.delay(1200);

    const len = answer.length;
    const hasStructure = /(背景|任务|目标|行动|结果|数据|指标|反思)/.test(answer);
    const hasData = /\d+%?|\d+万|\d+亿|提升|增长|降低/.test(answer);
    const hasReflection = /(反思|总结|复盘|如果|下次)/.test(answer);

    let score = 70;
    if (len > 100) score += 5;
    if (len > 300) score += 5;
    if (hasStructure) score += 5;
    if (hasData) score += 5;
    if (hasReflection) score += 5;
    if (answer.includes("STAR")) score += 3;
    score = Math.min(95, Math.max(50, score));

    const problems: string[] = [];
    if (len < 150) problems.push("回答过于简短，缺乏必要的背景和细节支撑");
    if (!hasStructure) problems.push("回答结构不够清晰，建议使用STAR或背景-行动-结果的结构组织内容");
    if (!hasData) problems.push("缺少具体的数据或指标来验证设计效果");
    if (!hasReflection) problems.push("缺少对项目的反思和复盘，面试官希望看到你的成长思维");
    if (answer.includes("我觉得") || answer.includes("大概") || answer.includes("可能")) {
      problems.push("表达中存在较多模糊性词汇，建议使用更确定的表述增强说服力");
    }
    if (problems.length === 0) {
      problems.push("整体不错，但在真实面试中可能会被追问更多细节，建议准备更深入的扩展回答");
    }

    const suggestions: string[] = [
      hasStructure
        ? "结构较好，但可以更明确地标注每个部分，让面试官更容易跟上你的思路"
        : "建议使用 背景-任务-行动-结果 的结构重新组织回答",
      hasData
        ? "数据支撑较好，可以补充更多维度的数据来增强说服力"
        : "补充项目中的关键指标变化数据，例如转化率提升、用户满意度变化等",
      "增加对设计决策过程的描述，说明为什么选择了这个方案而不是其他方案",
      "准备一个30秒、1分钟、3分钟三个版本的回答，以应对不同时长的面试场景",
    ];

    const optimizedAnswer = `（AI优化版本）\n\n在我的这个项目中，我主要负责[具体模块]的设计工作。\n\n【背景】当时业务面临的核心问题是[具体问题]，这直接影响了[关键指标]。\n\n【任务】我的目标是通过设计手段在[时间周期]内将[核心指标]提升/优化[X%]。\n\n【行动】我首先进行了[研究方法]来了解用户需求，然后提出了[设计方案]，并与[相关方]进行了多轮评审和迭代。关键的设计决策是[决策点]，原因是[决策理由]。\n\n【结果】最终该方案上线后，[核心指标]提升了[X%]，用户反馈[具体反馈]。\n\n【反思】回顾这个项目，我认为最大的收获是[收获]，如果再做一次，我会在[优化点]上做得更好。`;

    return {
      score,
      summary:
        score >= 85
          ? "回答质量较高，结构清晰且有数据支撑，展现了较好的项目深度和设计思维。"
          : score >= 70
            ? "整体回答较完整，但项目结果和业务价值表达不足，结构和数据支撑有优化空间。"
            : "回答需要大幅改进，建议重新梳理项目经历的结构，补充数据和反思。",
      problems: problems.slice(0, 3),
      suggestions: suggestions.slice(0, 3),
      recommendedStructure: "背景介绍 → 关键问题 → 我的设计动作 → 结果与反思",
      optimizedAnswer,
      followUpQuestions: [
        "这个项目中你最大的设计取舍是什么？",
        "你如何证明这个设计方案是有效的？",
        "如果重新做一次，你会优化哪里？",
        "在这个项目中，你和团队是如何协作的？",
        "当时有没有遇到过阻力，你是如何推动的？",
      ],
    };
  }

  async generateFollowUpQuestion(question: string, answer: string, analysis: AnswerAnalysis): Promise<string> {
    await this.delay(800);
    const followUps = analysis.followUpQuestions;
    return followUps[Math.floor(Math.random() * followUps.length)];
  }

  async generateInterviewReview(
    history: { question: string; answer: string; analysis: AnswerAnalysis }[]
  ): Promise<InterviewReview> {
    await this.delay(1500);
    const avgScore = Math.round(history.reduce((sum, h) => sum + h.analysis.score, 0) / history.length);

    const strengthsSet = new Set<string>();
    const weaknessesSet = new Set<string>();
    history.forEach((h) => {
      if (h.analysis.score >= 80) {
        strengthsSet.add("能够较好地表达项目经历和设计理念");
        strengthsSet.add("具备一定的结构化和逻辑思维能力");
      }
      h.analysis.problems.forEach((p) => {
        if (p.includes("结构")) weaknessesSet.add("回答结构需要进一步优化，建议统一使用STAR法则");
        if (p.includes("数据")) weaknessesSet.add("缺少量化数据支撑，建议准备核心指标");
        if (p.includes("反思")) weaknessesSet.add("项目复盘和反思不足，建议准备成长型回答");
      });
    });

    return {
      overallScore: avgScore,
      summary: `本次模拟面试共回答${history.length}道问题，平均得分${avgScore}分。${avgScore >= 80 ? "整体表现优秀，展现了较好的专业素养。" : avgScore >= 65 ? "整体表现良好，但仍有明显的提升空间。" : "需要系统性地准备面试，建议从项目梳理和结构训练开始。"}`,
      strengths: Array.from(strengthsSet).slice(0, 3),
      weaknesses: Array.from(weaknessesSet).slice(0, 3),
      improvements: [
        "针对每个核心项目准备STAR结构的标准回答",
        "为每个项目准备至少3个关键数据指标",
        "准备设计决策的理由和备选方案的对比",
        "练习在2分钟内清晰表达一个完整项目",
        "准备至少3个项目的深度追问回答",
      ],
      preparationAdvice:
        "建议按照岗位方向梳理3-5个核心项目，每个项目按照背景-任务-行动-结果的结构准备标准回答。同时针对常见的设计方法论、团队协作、职业规划类问题准备标准答案。每天进行1-2次模拟面试训练，逐步提升表达流畅度和结构清晰度。",
    };
  }

  async analyzeTranscript(text: string): Promise<TranscriptAnalysis[]> {
    await this.delay(2000);
    // 简单模拟：将文本按换行分割，假设奇数行是问题，偶数行是回答
    const lines = text
      .split(/\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const results: TranscriptAnalysis[] = [];
    for (let i = 0; i < lines.length; i += 2) {
      const question = lines[i];
      const answer = lines[i + 1] || "（未回答）";
      const analysis = await this.analyzeAnswer(question, answer);
      results.push({ question, answer, analysis });
    }

    if (results.length === 0) {
      results.push({
        question: "面试记录解析",
        answer: text.slice(0, 200) + "...",
        analysis: await this.analyzeAnswer("请介绍一个项目", text),
      });
    }

    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================
// TODO: Tencent Hunyuan Provider (待接入)
// ============================================================
// class TencentHunyuanProvider implements AIProvider {
//   // 接入腾讯混元大模型 API
// }

// ============================================================
// TODO: Custom LLM Provider (待接入)
// ============================================================
// class CustomLLMProvider implements AIProvider {
//   // 接入其他大模型 API
// }

// ============================================================
// AI Service Singleton
// ============================================================
class InterviewAIService {
  private provider: AIProvider;

  constructor(provider: AIProvider = new MockAIProvider()) {
    this.provider = provider;
  }

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  generateInterviewQuestion(config: InterviewConfig, history: string[]) {
    return this.provider.generateInterviewQuestion(config, history);
  }

  analyzeAnswer(question: string, answer: string) {
    return this.provider.analyzeAnswer(question, answer);
  }

  generateFollowUpQuestion(question: string, answer: string, analysis: AnswerAnalysis) {
    return this.provider.generateFollowUpQuestion(question, answer, analysis);
  }

  generateInterviewReview(history: { question: string; answer: string; analysis: AnswerAnalysis }[]) {
    return this.provider.generateInterviewReview(history);
  }

  analyzeTranscript(text: string) {
    return this.provider.analyzeTranscript(text);
  }
}

export const interviewAI = new InterviewAIService();

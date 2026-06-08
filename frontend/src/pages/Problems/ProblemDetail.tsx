import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Clock,
  Cpu,
  Tag,
  CheckCircle2,
  XCircle,
  Send,
  RotateCcw,
  Copy,
  Check,
  BookOpen,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import './ProblemDetail.css';

const mockProblem = {
  id: 1,
  title: '两数之和',
  difficulty: 'easy' as const,
  tags: ['数组', '哈希表'],
  description: `给定一个整数数组 \`nums\` 和一个整数目标值 \`target\`，请你在该数组中找出和为目标值 \`target\` 的那两个整数，并返回它们的数组下标。

你可以假设每种输入只会对应一个答案。但是，数组中同一个元素在答案里不能重复出现。

你可以按任意顺序返回答案。`,
  inputFormat: `第一行包含一个整数 n，表示数组的长度。
第二行包含 n 个整数，表示数组 nums。
第三行包含一个整数 target，表示目标值。`,
  outputFormat: `输出两个整数，表示满足条件的两个元素的下标，用空格分隔。`,
  constraints: [
    '2 <= nums.length <= 10^4',
    '-10^9 <= nums[i] <= 10^9',
    '-10^9 <= target <= 10^9',
    '只会存在一个有效答案',
  ],
  samples: [
    {
      input: '4\n2 7 11 15\n9',
      output: '0 1',
      explanation: '因为 nums[0] + nums[1] == 9，返回 [0, 1]。',
    },
    {
      input: '3\n3 2 4\n6',
      output: '1 2',
      explanation: '因为 nums[1] + nums[2] == 6，返回 [1, 2]。',
    },
  ],
  timeLimit: 1000,
  memoryLimit: 256,
  solves: 12580,
  acceptance: 49.2,
};

const relatedProblems = [
  { id: 15, title: '三数之和', difficulty: 'medium' as const },
  { id: 16, title: '四数之和', difficulty: 'medium' as const },
  { id: 49, title: '字母异位词分组', difficulty: 'medium' as const },
  { id: 128, title: '最长连续序列', difficulty: 'medium' as const },
];

const languages = [
  { id: 'cpp', label: 'C++', defaultCode: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        \n    }\n};\n\nint main() {\n    // Test your solution\n    return 0;\n}' },
  { id: 'python', label: 'Python', defaultCode: 'from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your solution here\n        pass' },
  { id: 'java', label: 'Java', defaultCode: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        \n    }\n}' },
  { id: 'javascript', label: 'JavaScript', defaultCode: '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your solution here\n    \n};' },
];

type SubmissionStatus = 'idle' | 'submitting' | 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error';

interface SubmissionResult {
  status: SubmissionStatus;
  runtime?: string;
  memory?: string;
  testCase?: number;
  totalCases?: number;
}

export default function ProblemDetail() {
  const { id: _id } = useParams();
  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [code, setCode] = useState(languages[0].defaultCode);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeSample, setActiveSample] = useState(0);

  const handleLangChange = (langId: string) => {
    const lang = languages.find((l) => l.id === langId)!;
    setSelectedLang(lang);
    setCode(lang.defaultCode);
  };

  const handleSubmit = () => {
    setResult({ status: 'submitting' });
    // Simulate submission
    setTimeout(() => {
      setResult({
        status: 'accepted',
        runtime: '56ms',
        memory: '42.3MB',
        testCase: 61,
        totalCases: 61,
      });
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusMessages: Record<SubmissionStatus, string> = {
    idle: '',
    submitting: '评测中...',
    accepted: '通过',
    wrong_answer: '答案错误',
    time_limit: '超出时间限制',
    runtime_error: '运行时错误',
  };

  return (
    <div className="problem-detail-page">
      <div className="pd-container">
        {/* Left Panel - Problem Description */}
        <div className="pd-left">
          <div className="pd-nav">
            <Link to="/problems" className="pd-back">
              <ChevronLeft size={18} />
              返回题库
            </Link>
            <span className="pd-id">#{mockProblem.id}</span>
          </div>

          <div className="pd-header">
            <h1 className="pd-title">{mockProblem.title}</h1>
            <div className="pd-meta">
              <span className={`difficulty-badge difficulty-badge--${mockProblem.difficulty}`}>
                {mockProblem.difficulty === 'easy' ? '简单' : mockProblem.difficulty === 'medium' ? '中等' : '困难'}
              </span>
              <div className="pd-meta-item">
                <Clock size={14} />
                <span>{mockProblem.timeLimit}ms</span>
              </div>
              <div className="pd-meta-item">
                <Cpu size={14} />
                <span>{mockProblem.memoryLimit}MB</span>
              </div>
            </div>
            <div className="pd-tags">
              {mockProblem.tags.map((tag) => (
                <span key={tag} className="pd-tag">
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="pd-tabs">
            <button
              className={`pd-tab ${activeTab === 'description' ? 'pd-tab--active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              <BookOpen size={16} />
              题目描述
            </button>
            <button
              className={`pd-tab ${activeTab === 'submissions' ? 'pd-tab--active' : ''}`}
              onClick={() => setActiveTab('submissions')}
            >
              <MessageSquare size={16} />
              提交记录
            </button>
          </div>

          {/* Description Content */}
          {activeTab === 'description' && (
            <div className="pd-content">
              <div className="pd-section">
                <h3>题目描述</h3>
                <div className="pd-text">
                  {mockProblem.description.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="pd-section">
                <h3>输入格式</h3>
                <div className="pd-text">
                  {mockProblem.inputFormat.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="pd-section">
                <h3>输出格式</h3>
                <div className="pd-text">
                  {mockProblem.outputFormat.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="pd-section">
                <h3>约束条件</h3>
                <ul className="pd-constraints">
                  {mockProblem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="pd-section">
                <h3>样例</h3>
                <div className="pd-samples">
                  {mockProblem.samples.map((sample, i) => (
                    <div key={i} className={`pd-sample ${activeSample === i ? 'pd-sample--active' : ''}`}>
                      <button
                        className="pd-sample-toggle"
                        onClick={() => setActiveSample(activeSample === i ? -1 : i)}
                      >
                        <span>样例 {i + 1}</span>
                        <ChevronDown size={16} />
                      </button>
                      {activeSample === i && (
                        <div className="pd-sample-content">
                          <div className="pd-sample-io">
                            <div className="pd-sample-block">
                              <span className="pd-sample-label">输入</span>
                              <pre>{sample.input}</pre>
                            </div>
                            <div className="pd-sample-block">
                              <span className="pd-sample-label">输出</span>
                              <pre>{sample.output}</pre>
                            </div>
                          </div>
                          {sample.explanation && (
                            <div className="pd-sample-explain">
                              <strong>解释：</strong> {sample.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="pd-content">
              <div className="pd-submissions-empty">
                <Send size={48} />
                <h3>暂无提交记录</h3>
                <p>在右侧编辑器中编写代码并提交</p>
              </div>
            </div>
          )}

          {/* Related Problems */}
          <div className="pd-related">
            <h3>相关题目</h3>
            <div className="pd-related-list">
              {relatedProblems.map((rp) => (
                <Link key={rp.id} to={`/problems/${rp.id}`} className="pd-related-item">
                  <span className="pd-related-id">#{rp.id}</span>
                  <span className="pd-related-title">{rp.title}</span>
                  <span className={`difficulty-badge difficulty-badge--${rp.difficulty}`}>
                    {rp.difficulty === 'medium' ? '中等' : '困难'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="pd-right">
          <div className="pd-editor-header">
            <div className="pd-lang-select">
              <select
                value={selectedLang.id}
                onChange={(e) => handleLangChange(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="pd-editor-actions">
              <button className="pd-btn-icon" onClick={handleCopy} title="复制代码">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button className="pd-btn-icon" onClick={() => setCode(selectedLang.defaultCode)} title="重置代码">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <div className="pd-editor">
            <div className="pd-line-numbers">
              {code.split('\n').map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
            <textarea
              className="pd-code-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* Result Panel */}
          {result && (
            <div className={`pd-result pd-result--${result.status}`}>
              {result.status === 'submitting' ? (
                <div className="pd-result-loading">
                  <div className="pd-spinner" />
                  <span>评测中，请稍候...</span>
                </div>
              ) : (
                <>
                  <div className="pd-result-header">
                    {result.status === 'accepted' ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <XCircle size={20} />
                    )}
                    <span className="pd-result-status">
                      {statusMessages[result.status]}
                    </span>
                  </div>
                  {result.status === 'accepted' && (
                    <div className="pd-result-details">
                      <span>通过全部 {result.totalCases} 个测试用例</span>
                      <div className="pd-result-stats">
                        <span>执行用时: {result.runtime}</span>
                        <span>内存消耗: {result.memory}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="pd-submit-bar">
            <button className="pd-submit-btn" onClick={handleSubmit}>
              <Send size={16} />
              提交代码
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

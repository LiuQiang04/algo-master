import { useState, useEffect } from 'react';
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
  Play,
} from 'lucide-react';
import { getProblemById } from '@/services/problems';
import { submitCode, getSubmissions, runSample, getSubmissionStatus } from '@/services/submissions';
import type { Problem, Submission, SubmissionStatus, TestCaseResult, RunSampleResponse } from '@/types';
import CodeEditor from '../../components/UI/CodeEditor';
import './ProblemDetail.css';

const languages = [
  { id: 'cpp', label: 'C++', defaultCode: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Write your solution here\n    \n};\n\nint main() {\n    return 0;\n}' },
  { id: 'python', label: 'Python', defaultCode: 'from typing import List\n\nclass Solution:\n    def solve(self) -> None:\n        # Write your solution here\n        pass' },
  { id: 'java', label: 'Java', defaultCode: 'class Solution {\n    // Write your solution here\n    \n}' },
  { id: 'javascript', label: 'JavaScript', defaultCode: '/**\n * Write your solution here\n */\nfunction solve() {\n    \n}' },
];

interface LocalSubmissionResult {
  status: SubmissionStatus;
  runtime?: number;
  memory?: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  errorMessage?: string;
}

const statusMessages: Record<SubmissionStatus, string> = {
  pending: '等待评测',
  judging: '评测中...',
  accepted: '通过',
  wrong_answer: '答案错误',
  time_limit_exceeded: '超出时间限制',
  memory_limit_exceeded: '超出内存限制',
  runtime_error: '运行时错误',
  compile_error: '编译错误',
};

export default function ProblemDetail() {
  const { id } = useParams<{ id: string }>();
  const problemId = Number(id);

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'description' | 'submissions'>('description');
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [code, setCode] = useState(languages[0].defaultCode);
  const [result, setResult] = useState<LocalSubmissionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeSample, setActiveSample] = useState(0);

  // Submissions
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  // Run Sample
  const [runSampleResult, setRunSampleResult] = useState<RunSampleResponse | null>(null);
  const [runSampleLoading, setRunSampleLoading] = useState(false);

  // Fetch problem details
  useEffect(() => {
    if (!problemId) return;
    setLoading(true);
    getProblemById(problemId)
      .then(setProblem)
      .catch(() => setError('加载题目失败'))
      .finally(() => setLoading(false));
  }, [problemId]);

  // Fetch submissions when switching to submissions tab
  useEffect(() => {
    if (activeTab !== 'submissions' || !problemId) return;
    setSubmissionsLoading(true);
    getSubmissions({ problemId, pageSize: 20 } as any)
      .then((data) => setSubmissions(data.items))
      .catch(() => {})
      .finally(() => setSubmissionsLoading(false));
  }, [activeTab, problemId]);

  const handleLangChange = (langId: string) => {
    const lang = languages.find((l) => l.id === langId)!;
    setSelectedLang(lang);
    setCode(lang.defaultCode);
  };

  const handleSubmit = async () => {
    if (!problemId || submitting) return;
    setSubmitting(true);
    setResult({ status: 'judging' });
    try {
      const res = await submitCode(problemId, {
        language: selectedLang.id as any,
        code,
      });
      // Start polling
      const submissionId = res.submissionId;
      const interval = setInterval(async () => {
        try {
          const status = await getSubmissionStatus(submissionId);
          if (status.status !== 'pending' && status.status !== 'judging') {
            clearInterval(interval);
            setSubmitting(false);
            setResult({
              status: status.status,
              runtime: status.executionTime,
              memory: status.memoryUsed,
              testCasesPassed: status.score ? Math.round(status.score / 100 * 10) : 0,
              totalTestCases: 10,
            });
          }
        } catch {
          clearInterval(interval);
          setSubmitting(false);
          setResult({ status: 'runtime_error', errorMessage: '获取评测结果失败' });
        }
      }, 1000);
      // 30s timeout — also releases submitting
      setTimeout(() => {
        clearInterval(interval);
        setSubmitting(false);
      }, 30000);
    } catch {
      setSubmitting(false);
      setResult({ status: 'runtime_error', errorMessage: '提交失败，请重试' });
    }
  };

  const handleRunSample = async () => {
    if (!problemId || runSampleLoading) return;
    setRunSampleLoading(true);
    setRunSampleResult(null);
    try {
      const res = await runSample(problemId, {
        language: selectedLang.id,
        code,
      });
      setRunSampleResult(res);
    } catch {
      setRunSampleResult({ compileError: '运行失败，请重试', results: [] });
    } finally {
      setRunSampleLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="problem-detail-page">
        <div className="pd-container">
          <div className="pd-left">
            <div className="pd-empty-state">
              <div className="pd-spinner" />
              <p>加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="problem-detail-page">
        <div className="pd-container">
          <div className="pd-left">
            <div className="pd-empty-state">
              <XCircle size={48} />
              <h3>{error || '题目不存在'}</h3>
              <Link to="/problems" className="pd-back">返回题库</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const difficultyText = problem.difficulty === 'easy' ? '简单' : problem.difficulty === 'medium' ? '中等' : '困难';

  // Parse samples from problem data
  const samples = problem.sampleInput && problem.sampleOutput
    ? [{ input: problem.sampleInput, output: problem.sampleOutput, explanation: problem.hint }]
    : [];

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
            <span className="pd-id">#{problem.id}</span>
          </div>

          <div className="pd-header">
            <h1 className="pd-title">{problem.title}</h1>
            <div className="pd-meta">
              <span className={`difficulty-badge difficulty-badge--${problem.difficulty}`}>
                {difficultyText}
              </span>
              <div className="pd-meta-item">
                <Clock size={14} />
                <span>{problem.timeLimit}ms</span>
              </div>
              <div className="pd-meta-item">
                <Cpu size={14} />
                <span>{problem.memoryLimit}MB</span>
              </div>
            </div>
            <div className="pd-tags">
              {problem.tags.map((tag) => (
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
                  {problem.description.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              {problem.inputFormat && (
                <div className="pd-section">
                  <h3>输入格式</h3>
                  <div className="pd-text">
                    {problem.inputFormat.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {problem.outputFormat && (
                <div className="pd-section">
                  <h3>输出格式</h3>
                  <div className="pd-text">
                    {problem.outputFormat.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {samples.length > 0 && (
                <div className="pd-section">
                  <h3>样例</h3>
                  <div className="pd-samples">
                    {samples.map((sample, i) => (
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
              )}

              {problem.hint && !samples.length && (
                <div className="pd-section">
                  <h3>提示</h3>
                  <div className="pd-text">
                    <p>{problem.hint}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="pd-content">
              {submissionsLoading ? (
                <div className="pd-submissions-empty">
                  <div className="pd-spinner" />
                  <p>加载提交记录...</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="pd-submissions-empty">
                  <Send size={48} />
                  <h3>暂无提交记录</h3>
                  <p>在右侧编辑器中编写代码并提交</p>
                </div>
              ) : (
                <div className="pd-submissions-list">
                  <table className="pd-submissions-table">
                    <thead>
                      <tr>
                        <th>状态</th>
                        <th>语言</th>
                        <th>用时</th>
                        <th>内存</th>
                        <th>时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.id}>
                          <td>
                            <span className={`sub-status sub-status--${sub.status}`}>
                              {sub.status === 'accepted' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                              {statusMessages[sub.status]}
                            </span>
                          </td>
                          <td>{sub.language}</td>
                          <td>{sub.executionTime ? `${sub.executionTime}ms` : '-'}</td>
                          <td>{sub.memoryUsed ? `${(sub.memoryUsed / 1024 / 1024).toFixed(1)}MB` : '-'}</td>
                          <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
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
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLang.id as 'cpp' | 'python' | 'java' | 'javascript'}
              onSubmit={handleSubmit}
            />
          </div>

          {/* Result Panel */}
          {result && (
            <div className={`pd-result pd-result--${result.status}`}>
              {result.status === 'judging' || result.status === 'pending' ? (
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
                  <div className="pd-result-details">
                    {result.testCasesPassed !== undefined && result.totalTestCases !== undefined && (
                      <span>通过 {result.testCasesPassed}/{result.totalTestCases} 个测试用例</span>
                    )}
                    <div className="pd-result-stats">
                      {result.runtime !== undefined && <span>执行用时: {result.runtime}ms</span>}
                      {result.memory !== undefined && <span>内存消耗: {(result.memory / 1024 / 1024).toFixed(1)}MB</span>}
                    </div>
                    {result.errorMessage && (
                      <pre className="pd-result-error">{result.errorMessage}</pre>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Run Sample Result Panel */}
          {runSampleResult && (
            <div className="pd-run-sample-result">
              <div className="pd-run-sample-result-header">
                <h3>运行样例结果</h3>
                <button onClick={() => setRunSampleResult(null)}>×</button>
              </div>
              {runSampleResult.compileError ? (
                <pre className="pd-result-error">{runSampleResult.compileError}</pre>
              ) : (
                runSampleResult.results.map((r, i) => (
                  <div key={i} className={`pd-sample-card ${r.passed ? 'pd-sample-card--pass' : 'pd-sample-card--fail'}`}>
                    <div className="pd-sample-card-header">
                      <span>样例 {i + 1}</span>
                      {r.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      <span>{r.passed ? '通过' : '未通过'} {r.runtime != null && `(${r.runtime}ms)`}</span>
                    </div>
                    <div className="pd-sample-card-io">
                      <div><span>输入</span><pre>{r.input}</pre></div>
                      <div><span>预期输出</span><pre>{r.expectedOutput}</pre></div>
                      <div><span>实际输出</span><pre>{r.actualOutput || '-'}</pre></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="pd-submit-bar">
            <button
              className="pd-run-sample-btn"
              onClick={handleRunSample}
              disabled={runSampleLoading || submitting}
            >
              <Play size={16} />
              {runSampleLoading ? '运行中...' : '运行样例'}
            </button>
            <button className="pd-submit-btn" onClick={handleSubmit} disabled={submitting}>
              <Send size={16} />
              {submitting ? '提交中...' : '提交代码'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

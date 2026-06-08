import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Code2,
  Tag,
  X,
} from 'lucide-react';
import './ProblemList.css';

interface Problem {
  id: number;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  solves: number;
  acceptance: number;
  status?: 'solved' | 'attempted' | null;
}

const allTags = [
  '数组', '字符串', '哈希表', '动态规划', '数学',
  '排序', '贪心', '二分查找', '树', '图',
  '链表', '栈', '队列', '堆', '递归',
  'BFS', 'DFS', '回溯', '滑动窗口', '双指针',
];

const mockProblems: Problem[] = [
  { id: 1, title: '两数之和', difficulty: 'easy', tags: ['数组', '哈希表'], solves: 12580, acceptance: 49.2, status: 'solved' },
  { id: 2, title: '最长回文子串', difficulty: 'medium', tags: ['字符串', '动态规划'], solves: 8432, acceptance: 33.1, status: 'attempted' },
  { id: 3, title: '合并 K 个升序链表', difficulty: 'hard', tags: ['链表', '堆'], solves: 3210, acceptance: 48.7 },
  { id: 4, title: '二叉树的层序遍历', difficulty: 'medium', tags: ['树', 'BFS'], solves: 9876, acceptance: 63.5, status: 'solved' },
  { id: 5, title: '有效的括号', difficulty: 'easy', tags: ['栈', '字符串'], solves: 15234, acceptance: 43.8, status: 'solved' },
  { id: 6, title: '最大子数组和', difficulty: 'medium', tags: ['数组', '动态规划'], solves: 11230, acceptance: 50.2 },
  { id: 7, title: '接雨水', difficulty: 'hard', tags: ['数组', '双指针', '动态规划'], solves: 2890, acceptance: 59.1 },
  { id: 8, title: '搜索旋转排序数组', difficulty: 'medium', tags: ['数组', '二分查找'], solves: 6543, acceptance: 38.9 },
  { id: 9, title: '最长公共前缀', difficulty: 'easy', tags: ['字符串'], solves: 10876, acceptance: 40.3 },
  { id: 10, title: '三数之和', difficulty: 'medium', tags: ['数组', '排序', '双指针'], solves: 7654, acceptance: 32.7, status: 'attempted' },
  { id: 11, title: '删除链表的倒数第 N 个结点', difficulty: 'medium', tags: ['链表', '双指针'], solves: 8901, acceptance: 40.1 },
  { id: 12, title: '字母异位词分组', difficulty: 'medium', tags: ['哈希表', '字符串', '排序'], solves: 5432, acceptance: 67.2 },
  { id: 13, title: '最小覆盖子串', difficulty: 'hard', tags: ['哈希表', '字符串', '滑动窗口'], solves: 2100, acceptance: 43.5 },
  { id: 14, title: '买卖股票的最佳时机', difficulty: 'easy', tags: ['数组', '贪心'], solves: 13456, acceptance: 54.3 },
  { id: 15, title: '二叉树的最大深度', difficulty: 'easy', tags: ['树', 'DFS'], solves: 14321, acceptance: 73.1, status: 'solved' },
  { id: 16, title: '全排列', difficulty: 'medium', tags: ['数组', '回溯'], solves: 9123, acceptance: 75.4 },
  { id: 17, title: '合并区间', difficulty: 'medium', tags: ['数组', '排序'], solves: 7890, acceptance: 44.8 },
  { id: 18, title: '最大矩形', difficulty: 'hard', tags: ['栈', '数组', '动态规划'], solves: 1890, acceptance: 42.6 },
  { id: 19, title: '对称二叉树', difficulty: 'easy', tags: ['树', 'DFS', 'BFS'], solves: 11567, acceptance: 55.2 },
  { id: 20, title: '爬楼梯', difficulty: 'easy', tags: ['动态规划'], solves: 16789, acceptance: 51.8, status: 'solved' },
];

const ITEMS_PER_PAGE = 10;

const difficultyLabels = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export default function ProblemList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTagPanel, setShowTagPanel] = useState(false);

  const filteredProblems = useMemo(() => {
    return mockProblems.filter((p) => {
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery);

      const matchesDifficulty =
        difficultyFilter === 'all' || p.difficulty === difficultyFilter;

      const matchesTags =
        selectedTags.length === 0 || selectedTags.some((t) => p.tags.includes(t));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'solved' && p.status === 'solved') ||
        (statusFilter === 'attempted' && p.status === 'attempted') ||
        (statusFilter === 'todo' && !p.status);

      return matchesSearch && matchesDifficulty && matchesTags && matchesStatus;
    });
  }, [searchQuery, difficultyFilter, selectedTags, statusFilter]);

  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('all');
    setSelectedTags([]);
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const hasFilters = searchQuery || difficultyFilter !== 'all' || selectedTags.length > 0 || statusFilter !== 'all';

  return (
    <div className="problem-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="pl-header">
          <div>
            <h1 className="pl-title">题库</h1>
            <p className="pl-desc">共 {mockProblems.length} 道题目，持续更新中</p>
          </div>
        </div>

        {/* Filters */}
        <div className="pl-filters">
          <div className="pl-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="搜索题目编号或标题..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchQuery && (
              <button className="pl-search-clear" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="pl-filter-row">
            <div className="pl-filter-group">
              <span className="pl-filter-label">难度</span>
              <div className="pl-filter-chips">
                <button
                  className={`pl-chip ${difficultyFilter === 'all' ? 'pl-chip--active' : ''}`}
                  onClick={() => { setDifficultyFilter('all'); setCurrentPage(1); }}
                >
                  全部
                </button>
                <button
                  className={`pl-chip pl-chip--easy ${difficultyFilter === 'easy' ? 'pl-chip--active' : ''}`}
                  onClick={() => { setDifficultyFilter('easy'); setCurrentPage(1); }}
                >
                  简单
                </button>
                <button
                  className={`pl-chip pl-chip--medium ${difficultyFilter === 'medium' ? 'pl-chip--active' : ''}`}
                  onClick={() => { setDifficultyFilter('medium'); setCurrentPage(1); }}
                >
                  中等
                </button>
                <button
                  className={`pl-chip pl-chip--hard ${difficultyFilter === 'hard' ? 'pl-chip--active' : ''}`}
                  onClick={() => { setDifficultyFilter('hard'); setCurrentPage(1); }}
                >
                  困难
                </button>
              </div>
            </div>

            <div className="pl-filter-group">
              <span className="pl-filter-label">状态</span>
              <div className="pl-filter-chips">
                <button
                  className={`pl-chip ${statusFilter === 'all' ? 'pl-chip--active' : ''}`}
                  onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
                >
                  全部
                </button>
                <button
                  className={`pl-chip ${statusFilter === 'solved' ? 'pl-chip--active' : ''}`}
                  onClick={() => { setStatusFilter('solved'); setCurrentPage(1); }}
                >
                  已通过
                </button>
                <button
                  className={`pl-chip ${statusFilter === 'attempted' ? 'pl-chip--active' : ''}`}
                  onClick={() => { setStatusFilter('attempted'); setCurrentPage(1); }}
                >
                  已尝试
                </button>
                <button
                  className={`pl-chip ${statusFilter === 'todo' ? 'pl-chip--active' : ''}`}
                  onClick={() => { setStatusFilter('todo'); setCurrentPage(1); }}
                >
                  未开始
                </button>
              </div>
            </div>

            <button
              className="pl-tag-toggle"
              onClick={() => setShowTagPanel(!showTagPanel)}
            >
              <Tag size={16} />
              标签筛选
              {selectedTags.length > 0 && (
                <span className="pl-tag-count">{selectedTags.length}</span>
              )}
            </button>

            {hasFilters && (
              <button className="pl-clear-btn" onClick={clearFilters}>
                <X size={14} />
                清除筛选
              </button>
            )}
          </div>

          {/* Tag Panel */}
          {showTagPanel && (
            <div className="pl-tag-panel">
              <div className="pl-tag-panel__header">
                <span>选择标签</span>
                {selectedTags.length > 0 && (
                  <button onClick={() => setSelectedTags([])}>清除</button>
                )}
              </div>
              <div className="pl-tag-panel__tags">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`pl-tag-btn ${selectedTags.includes(tag) ? 'pl-tag-btn--active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="pl-results-info">
          <span>共 {filteredProblems.length} 道题目</span>
        </div>

        {/* Problem Table */}
        <div className="pl-table-wrapper">
          <table className="pl-table">
            <thead>
              <tr>
                <th className="pl-th-status">状态</th>
                <th className="pl-th-id">编号</th>
                <th className="pl-th-title">题目</th>
                <th className="pl-th-tags">标签</th>
                <th className="pl-th-difficulty">难度</th>
                <th className="pl-th-acceptance">通过率</th>
                <th className="pl-th-solves">解题数</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProblems.map((problem) => (
                <tr key={problem.id} className="pl-row">
                  <td className="pl-td-status">
                    {problem.status === 'solved' && (
                      <CheckCircle2 size={18} className="status-icon status-icon--solved" />
                    )}
                    {problem.status === 'attempted' && (
                      <Code2 size={18} className="status-icon status-icon--attempted" />
                    )}
                  </td>
                  <td className="pl-td-id">{problem.id}</td>
                  <td className="pl-td-title">
                    <Link to={`/problems/${problem.id}`}>{problem.title}</Link>
                  </td>
                  <td className="pl-td-tags">
                    <div className="pl-tags-list">
                      {problem.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="pl-tag">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="pl-td-difficulty">
                    <span className={`difficulty-badge difficulty-badge--${problem.difficulty}`}>
                      {difficultyLabels[problem.difficulty]}
                    </span>
                  </td>
                  <td className="pl-td-acceptance">{problem.acceptance}%</td>
                  <td className="pl-td-solves">{problem.solves.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredProblems.length === 0 && (
          <div className="pl-empty">
            <Search size={48} />
            <h3>没有找到匹配的题目</h3>
            <p>尝试调整筛选条件或搜索关键词</p>
            <button onClick={clearFilters} className="pl-empty-btn">清除所有筛选</button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pl-pagination">
            <button
              className="pl-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pl-page-btn ${page === currentPage ? 'pl-page-btn--active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pl-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

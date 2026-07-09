import { useState, useEffect, useCallback } from 'react';
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
import { getProblems, getProblemTags } from '@/services/problems';
import type { ProblemListItem } from '@/types';
import './ProblemList.css';

const ITEMS_PER_PAGE = 10;

const difficultyLabels: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export default function ProblemList() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showTagPanel, setShowTagPanel] = useState(false);

  // Fetch tags on mount
  useEffect(() => {
    getProblemTags()
      .then(setAllTags)
      .catch(() => {
        // Fallback tags if API not available
        setAllTags([
          '数组', '字符串', '哈希表', '动态规划', '数学',
          '排序', '贪心', '二分查找', '树', '图',
          '链表', '栈', '队列', '堆', '递归',
          'BFS', 'DFS', '回溯', '滑动窗口', '双指针',
        ]);
      });
  }, []);

  // Fetch problems when filters change
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        pageSize: ITEMS_PER_PAGE,
      };
      if (searchQuery) params.keyword = searchQuery;
      if (difficultyFilter !== 'all') params.difficulty = difficultyFilter;
      if (selectedTags.length > 0) params.tag = selectedTags.join(',');
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await getProblems(params as any);
      setProblems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // If API fails, show empty state
      setProblems([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, difficultyFilter, selectedTags, statusFilter, searchQuery]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');
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
            <p className="pl-desc">共 {total} 道题目，持续更新中</p>
          </div>
        </div>

        {/* Filters */}
        <div className="pl-filters">
          <div className="pl-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="搜索题目编号或标题..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button className="pl-search-clear" onClick={() => setSearchInput('')}>
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
          <span>共 {total} 道题目</span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="pl-empty">
            <div className="pd-spinner" />
            <h3>加载中...</h3>
          </div>
        )}

        {/* Problem Table */}
        {!loading && problems.length > 0 && (
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
                {problems.map((problem) => (
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
                        {problem.tags.slice(0, 3).map((tag: any) => (
                          <span key={tag.id || tag} className="pl-tag">{tag.name || tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="pl-td-difficulty">
                      <span className={`difficulty-badge difficulty-badge--${['easy','easy','medium','hard','hard'][(problem.difficulty as any) - 1] || 'medium'}`}>
                        {({ 1: '简单', 2: '简单', 3: '中等', 4: '困难', 5: '困难' } as any)[problem.difficulty] || '中等'}
                      </span>
                    </td>
                    <td className="pl-td-acceptance">{problem.acceptanceRate}%</td>
                    <td className="pl-td-solves">{problem.solvedCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && problems.length === 0 && (
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

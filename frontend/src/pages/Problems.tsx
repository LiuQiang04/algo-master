import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Problem {
  id: number;
  title: string;
  difficulty: '简单' | '中等' | '困难';
  category: string;
  solved: boolean;
  acceptance: string;
}

const Problems = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // 模拟题目数据
  const problems: Problem[] = [
    { id: 1, title: '两数之和', difficulty: '简单', category: '数组', solved: true, acceptance: '49.2%' },
    { id: 2, title: '无重复字符的最长子串', difficulty: '中等', category: '字符串', solved: false, acceptance: '35.8%' },
    { id: 3, title: '最长回文子串', difficulty: '中等', category: '字符串', solved: true, acceptance: '33.1%' },
    { id: 4, title: '合并两个有序链表', difficulty: '简单', category: '链表', solved: false, acceptance: '61.5%' },
    { id: 5, title: '二叉树的最大深度', difficulty: '简单', category: '树', solved: true, acceptance: '73.2%' },
    { id: 6, title: '有效的括号', difficulty: '简单', category: '栈', solved: false, acceptance: '43.8%' },
    { id: 7, title: '爬楼梯', difficulty: '简单', category: '动态规划', solved: true, acceptance: '51.2%' },
    { id: 8, title: '二分查找', difficulty: '简单', category: '二分', solved: false, acceptance: '55.7%' },
    { id: 9, title: '最大子数组和', difficulty: '中等', category: '动态规划', solved: true, acceptance: '50.1%' },
    { id: 10, title: '合并区间', difficulty: '中等', category: '排序', solved: false, acceptance: '44.3%' },
    { id: 11, title: '反转链表', difficulty: '简单', category: '链表', solved: true, acceptance: '70.5%' },
    { id: 12, title: '搜索旋转排序数组', difficulty: '中等', category: '二分', solved: false, acceptance: '38.9%' },
  ];

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单': return 'text-green-600 bg-green-100';
      case '中等': return 'text-yellow-600 bg-yellow-100';
      case '困难': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">题库</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="搜索题目..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">所有难度</option>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>
      </div>

      {/* Problem List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                题目
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                难度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分类
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                通过率
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProblems.map((problem) => (
              <tr key={problem.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {problem.solved ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/problems/${problem.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {problem.id}. {problem.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {problem.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {problem.acceptance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Problems;

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">关于 AlgoMaster</h3>
            <p className="text-gray-400 text-sm">
              AlgoMaster 是一个专业的算法竞赛学习平台，帮助你系统学习算法，
              提升编程能力，在竞赛中取得好成绩。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/problems" className="text-gray-400 hover:text-white text-sm transition-colors">
                  题库
                </Link>
              </li>
              <li>
                <Link to="/contests" className="text-gray-400 hover:text-white text-sm transition-colors">
                  竞赛
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-400 hover:text-white text-sm transition-colors">
                  社区
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                  排行榜
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">学习资源</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tutorials" className="text-gray-400 hover:text-white text-sm transition-colors">
                  教程
                </Link>
              </li>
              <li>
                <Link to="/algorithms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  算法分类
                </Link>
              </li>
              <li>
                <Link to="/data-structures" className="text-gray-400 hover:text-white text-sm transition-colors">
                  数据结构
                </Link>
              </li>
              <li>
                <Link to="/practice" className="text-gray-400 hover:text-white text-sm transition-colors">
                  专项练习
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">
                邮箱: support@algomaster.com
              </li>
              <li className="text-gray-400 text-sm">
                GitHub: github.com/algomaster
              </li>
              <li className="text-gray-400 text-sm">
                微信公众号: AlgoMaster
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 AlgoMaster. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

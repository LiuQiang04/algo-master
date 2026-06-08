import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">A</span>
            </div>
            <span className="text-xl font-bold">AlgoMaster</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/problems" className="hover:text-blue-200 transition-colors">
              题库
            </Link>
            <Link to="/contests" className="hover:text-blue-200 transition-colors">
              竞赛
            </Link>
            <Link to="/community" className="hover:text-blue-200 transition-colors">
              社区
            </Link>
            <Link to="/leaderboard" className="hover:text-blue-200 transition-colors">
              排行榜
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
            >
              登录
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              注册
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <nav className="flex flex-col space-y-3">
              <Link to="/problems" className="hover:text-blue-200 transition-colors">
                题库
              </Link>
              <Link to="/contests" className="hover:text-blue-200 transition-colors">
                竞赛
              </Link>
              <Link to="/community" className="hover:text-blue-200 transition-colors">
                社区
              </Link>
              <Link to="/leaderboard" className="hover:text-blue-200 transition-colors">
                排行榜
              </Link>
            </nav>
            <div className="flex space-x-4 mt-4">
              <Link
                to="/login"
                className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                注册
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

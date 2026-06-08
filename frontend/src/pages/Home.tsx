import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    {
      title: '丰富的题库',
      description: '涵盖各种算法和数据结构，从入门到进阶',
      icon: '📚',
    },
    {
      title: '在线评测',
      description: '实时代码评测，支持多种编程语言',
      icon: '⚡',
    },
    {
      title: '竞赛系统',
      description: '模拟真实竞赛环境，提升实战能力',
      icon: '🏆',
    },
    {
      title: '学习路径',
      description: '个性化学习推荐，系统掌握算法知识',
      icon: '🎯',
    },
    {
      title: '社区交流',
      description: '分享解题思路，与高手交流学习',
      icon: '💬',
    },
    {
      title: '成就系统',
      description: '完成挑战解锁成就，学习更有动力',
      icon: '🌟',
    },
  ];

  const stats = [
    { label: '题目数量', value: '1000+' },
    { label: '用户数量', value: '5000+' },
    { label: '竞赛次数', value: '100+' },
    { label: '解题次数', value: '50000+' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            算法竞赛学习平台
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            系统学习算法，提升编程能力，在竞赛中脱颖而出
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/problems"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              开始刷题
            </Link>
            <Link
              to="/register"
              className="px-8 py-3 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              免费注册
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">平台特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">准备好开始学习了吗？</h2>
          <p className="text-xl mb-8 text-blue-100">
            加入 AlgoMaster，开启你的算法竞赛之旅
          </p>
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            立即注册
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

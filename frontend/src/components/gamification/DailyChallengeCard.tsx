import React from 'react';
import type { DailyChallenge, DailyTask } from '../../types/gamification';

interface DailyChallengeCardProps {
  challenge: DailyChallenge | null;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  onComplete,
  isCompleted = false,
}) => {
  if (!challenge) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <p>今日暂无挑战</p>
        </div>
      </div>
    );
  }

  const difficultyStars = Array(5)
    .fill(0)
    .map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < challenge.problem.difficulty ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));

  return (
    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">每日挑战</h3>
        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
          +{challenge.bonusPoints} 积分
        </span>
      </div>

      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <h4 className="font-medium mb-2">{challenge.problem.title}</h4>
        <div className="flex items-center gap-1 mb-2">{difficultyStars}</div>
        <div className="flex flex-wrap gap-1">
          {challenge.problem.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="px-2 py-1 bg-white/20 rounded text-xs"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {isCompleted ? (
        <div className="text-center">
          <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="font-medium">今日挑战已完成!</p>
        </div>
      ) : (
        <button
          onClick={onComplete}
          className="w-full py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-white/90 transition-colors"
        >
          开始挑战
        </button>
      )}
    </div>
  );
};

interface DailyTaskListProps {
  tasks: DailyTask[];
}

export const DailyTaskList: React.FC<DailyTaskListProps> = ({ tasks }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-semibold text-gray-800 mb-4">每日任务</h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              task.completed ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  task.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {task.completed && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-800">{task.title}</p>
                <p className="text-xs text-gray-500">{task.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {task.current}/{task.target}
              </p>
              {task.reward > 0 && (
                <p className="text-xs text-yellow-600">+{task.reward} 积分</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyChallengeCard;

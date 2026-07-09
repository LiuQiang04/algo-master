import { Queue } from 'bullmq';
import { getRedisConfig } from '../utils/redis';

let _queue: Queue | null = null;

function getQueue(): Queue {
  if (!_queue) {
    const redisConfig = getRedisConfig();
    _queue = new Queue('judge', {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    });
  }
  return _queue;
}

/**
 * Lazy proxy so importing the module does not connect to Redis.
 * The underlying Queue is created on the first method call.
 */
export const judgeQueue: Queue = new Proxy({} as Queue, {
  get(_target, prop: keyof Queue) {
    const q = getQueue();
    const val = q[prop];
    return typeof val === 'function' ? val.bind(q) : val;
  },
});

export async function addJudgeTask(submissionId: string) {
  return getQueue().add('judge', { submissionId });
}

export async function closeJudgeQueue() {
  if (_queue) {
    await _queue.close();
    _queue = null;
  }
}

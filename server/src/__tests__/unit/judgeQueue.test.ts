import { addJudgeTask, closeJudgeQueue } from '../../queues/judgeQueue';

// Mock BullMQ Queue with dynamic return values so add() returns
// a realistic job object matching the input data.
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockImplementation((name, data) =>
      Promise.resolve({ id: `job-${Date.now()}`, data }),
    ),
    close: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock redis config so no real Redis connection is attempted
jest.mock('../../utils/redis', () => ({
  getRedisConfig: jest.fn(() => ({ host: 'localhost', port: 6379 })),
}));

describe('judgeQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Reset the lazy _queue after each test so every test starts with a
  // clean module-level _queue === null state.  This lets tests that
  // verify Queue constructor arguments reliably trigger a fresh init.
  afterEach(async () => {
    await closeJudgeQueue();
  });

  afterAll(async () => {
    await closeJudgeQueue();
  });

  describe('addJudgeTask', () => {
    it('should add a judge job with submissionId', async () => {
      const job = await addJudgeTask('sub-1');

      expect(job.data.submissionId).toBe('sub-1');
    });

    it('should propagate error when add fails', async () => {
      const { Queue } = require('bullmq');

      // Trigger lazy queue initialisation so we can grab the instance
      await addJudgeTask('trigger').catch(() => {});
      const instance = Queue.mock.results[0].value;
      instance.add.mockRejectedValue(new Error('Redis connection failed'));

      await expect(addJudgeTask('sub-1')).rejects.toThrow(
        'Redis connection failed',
      );
    });
  });

  describe('closeJudgeQueue', () => {
    it('should close the queue and reset to null', async () => {
      // First add a task to initialise the queue
      await addJudgeTask('sub-1');

      const { Queue } = require('bullmq');
      const instance = Queue.mock.results[0].value;

      // Then close
      await closeJudgeQueue();
      expect(instance.close).toHaveBeenCalled();
    });

    it('should not throw when closing an uninitialized queue', async () => {
      await expect(closeJudgeQueue()).resolves.not.toThrow();
    });
  });

  describe('queue configuration', () => {
    it('should configure with exponential backoff', async () => {
      const { Queue } = require('bullmq');

      // Trigger lazy queue init — without this, Queue constructor is never
      // called and the assertion below would always pass vacuously.
      await addJudgeTask('x');

      expect(Queue).toHaveBeenCalledWith(
        'judge',
        expect.objectContaining({
          defaultJobOptions: expect.objectContaining({
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          }),
        }),
      );
    });
  });
});

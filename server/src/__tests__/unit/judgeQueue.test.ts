import { addJudgeTask, closeJudgeQueue } from '../../queues/judgeQueue';

// Skip tests if Redis is not available on localhost:6379
const hasRedis = (() => {
  try {
    const { execSync } = require('child_process');
    execSync('node', {
      input:
        "require('net').createConnection(6379,'localhost',()=>process.exit(0)).on('error',()=>process.exit(1))",
      timeout: 2000,
      stdio: ['pipe', 'ignore', 'ignore'],
    });
    return true;
  } catch {
    return false;
  }
})();

const describeIf = hasRedis ? describe : describe.skip;

describeIf('judgeQueue', () => {
  afterAll(async () => {
    await closeJudgeQueue();
  });

  it('should add a job to the queue', async () => {
    const job = await addJudgeTask('test-submission-id');
    expect(job).toBeDefined();
    expect(job.data.submissionId).toBe('test-submission-id');
    await job.remove();
  }, 10000);
});

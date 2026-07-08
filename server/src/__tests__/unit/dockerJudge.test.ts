import { judge } from '../../services/judge/dockerJudge';

// Skip all tests if Docker is not available
const hasDocker = (() => {
  try {
    require('child_process').execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

const describeIf = hasDocker ? describe : describe.skip;

describeIf('dockerJudge', () => {
  it('should compile and run C++ code successfully', async () => {
    const code = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`;
    const result = await judge({
      language: 'cpp',
      code,
      testCases: [
        { input: '1 2', expectedOutput: '3' },
        { input: '5 3', expectedOutput: '8' },
      ],
      timeLimit: 1000,
      memoryLimit: 128,
    });
    expect(result.compileError).toBeNull();
    expect(result.results).toHaveLength(2);
    expect(result.results[0].passed).toBe(true);
    expect(result.summary.passed).toBe(2);
  }, 30000);

  it('should return compile error for invalid C++ code', async () => {
    const code = `#include <iostream>
int main() {
    cout << "missing namespace" << endl;
}`;
    const result = await judge({
      language: 'cpp',
      code,
      testCases: [{ input: '', expectedOutput: '' }],
      timeLimit: 1000,
      memoryLimit: 128,
    });
    expect(result.compileError).not.toBeNull();
  }, 30000);

  it('should detect wrong answer', async () => {
    const code = `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a * b << endl;  // wrong: multiply instead of add
    return 0;
}`;
    const result = await judge({
      language: 'cpp',
      code,
      testCases: [{ input: '2 3', expectedOutput: '5' }],
      timeLimit: 1000,
      memoryLimit: 128,
    });
    expect(result.results[0].passed).toBe(false);
    expect(result.results[0].actualOutput).toBe('6');
  }, 30000);
});

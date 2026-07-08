import { execFileSync } from 'child_process';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { getLanguageConfig } from './languageConfig';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  runtime: number | null;
  memory: number | null;
  errorMessage: string | null;
}

export interface JudgeResult {
  compileError: string | null;
  results: TestCaseResult[];
  summary: { passed: number; total: number };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Normalize a Windows path for Docker bind-mount compatibility.
 * Converts backslashes to forward slashes.
 */
function normalizeDockerPath(p: string): string {
  return p.replace(/\\/g, '/');
}

/**
 * Run a Docker container with the given arguments.
 * Enforces security/isolation defaults: no network, memory/cpu limits, read-only rootfs.
 */
function runDocker(
  args: string[],
  timeout: number,
  memoryLimit: number,
): string {
  return execFileSync(
    'docker',
    [
      'run',
      '--rm',
      '--network=none',
      `--memory=${memoryLimit}m`,
      '--cpus=0.5',
      '--read-only',
      ...args,
    ],
    {
      timeout: timeout * 1000,
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
    },
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compile (if necessary) and execute user code against a set of test cases
 * inside an isolated Docker container.
 *
 * @param options.language    Language key from languageConfig (e.g. "cpp", "python")
 * @param options.code        Source code as a string
 * @param options.testCases   Array of { input, expectedOutput }
 * @param options.timeLimit   Per-case execution budget in **milliseconds**
 * @param options.memoryLimit Memory limit in megabytes
 */
export async function judge(options: {
  language: string;
  code: string;
  testCases: TestCase[];
  timeLimit: number;
  memoryLimit: number;
}): Promise<JudgeResult> {
  const { language, code, testCases, timeLimit, memoryLimit } = options;
  const config = getLanguageConfig(language);
  const workDir = path.join(os.tmpdir(), 'judge', randomUUID());

  try {
    fs.mkdirSync(workDir, { recursive: true });

    // Write source file
    fs.writeFileSync(path.join(workDir, config.sourceFile), code, 'utf-8');

    // ---- Compile (if required) -------------------------------------------
    let compileError: string | null = null;
    if (config.compile) {
      try {
        const compileArgs = [
          '--tmpfs=/tmp:exec', // writable temp for compiler internals
          `-v=${normalizeDockerPath(workDir)}:/judge`, // read-write so compiler can output
          '-w=/judge',
          'algo-arena-judge',
          config.compile.command,
          ...config.compile.args,
        ];
        runDocker(compileArgs, config.compile.timeout, 256);
      } catch (err: any) {
        compileError = err.stderr || err.message || 'Compilation failed';
        return {
          compileError,
          results: [],
          summary: { passed: 0, total: testCases.length },
        };
      }
    }

    // ---- Execute each test case ------------------------------------------
    const results: TestCaseResult[] = [];

    for (const tc of testCases) {
      try {
        const startTime = Date.now();

        const actualOutput = execFileSync(
          'docker',
          [
            'run',
            '--rm',
            '--network=none',
            `--memory=${memoryLimit}m`,
            '--cpus=0.5',
            '--read-only',
            '--tmpfs=/tmp:exec',
            `-v=${normalizeDockerPath(workDir)}:/judge:ro`,
            '-w=/judge',
            'algo-arena-judge',
            config.run.command,
            ...config.run.args,
          ],
          {
            input: tc.input,
            timeout: timeLimit * 2, // double the user limit for Docker overhead
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024,
          },
        );

        const runtime = Date.now() - startTime;

        // Normalise line endings and trim for comparison
        const expected = tc.expectedOutput.trim().replace(/\r\n/g, '\n');
        const actual = actualOutput.trim().replace(/\r\n/g, '\n');
        const passed = expected === actual;

        results.push({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput,
          passed,
          runtime,
          memory: null, // Docker memory stats omitted (complex to extract)
          errorMessage: null,
        });
      } catch (err: any) {
        const isTimeout =
          err.killed ||
          (err.message && err.message.includes('timed out'));

        results.push({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: err.stdout || null,
          passed: false,
          runtime: null,
          memory: null,
          errorMessage: isTimeout
            ? 'Time Limit Exceeded'
            : err.stderr || err.message,
        });
      }
    }

    return {
      compileError: null,
      results,
      summary: {
        passed: results.filter((r) => r.passed).length,
        total: testCases.length,
      },
    };
  } finally {
    // Clean up temporary files
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch {
      /* best-effort cleanup */
    }
  }
}

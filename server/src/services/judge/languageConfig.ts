export interface LanguageConfig {
  sourceFile: string;
  executableFile?: string;
  compile: {
    command: string;
    args: string[];
    timeout: number; // seconds
  } | null;
  run: {
    command: string;
    args: string[];
  };
}

const configs: Record<string, LanguageConfig> = {
  cpp: {
    sourceFile: 'solution.cpp',
    executableFile: 'solution',
    compile: {
      command: 'g++',
      args: ['-O2', '-o', 'solution', 'solution.cpp'],
      timeout: 15,
    },
    run: {
      command: './solution',
      args: [],
    },
  },
  python: {
    sourceFile: 'solution.py',
    compile: null,
    run: {
      command: 'python3',
      args: ['solution.py'],
    },
  },
  java: {
    sourceFile: 'Main.java',
    executableFile: 'Main.class',
    compile: {
      command: 'javac',
      args: ['Main.java'],
      timeout: 15,
    },
    run: {
      command: 'java',
      args: ['Main'],
    },
  },
  javascript: {
    sourceFile: 'solution.js',
    compile: null,
    run: {
      command: 'node',
      args: ['solution.js'],
    },
  },
};

export function getLanguageConfig(language: string): LanguageConfig {
  const config = configs[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return config;
}

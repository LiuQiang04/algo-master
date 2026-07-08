import { getLanguageConfig } from '../../services/judge/languageConfig';

describe('languageConfig', () => {
  it('should return cpp config with compile step', () => {
    const config = getLanguageConfig('cpp');
    expect(config.sourceFile).toBe('solution.cpp');
    expect(config.compile).not.toBeNull();
    expect(config.compile!.command).toBe('g++');
  });

  it('should return python config with no compile step', () => {
    const config = getLanguageConfig('python');
    expect(config.compile).toBeNull();
    expect(config.run.command).toBe('python3');
  });

  it('should return java config', () => {
    const config = getLanguageConfig('java');
    expect(config.sourceFile).toBe('Main.java');
    expect(config.compile).not.toBeNull();
  });

  it('should return javascript config', () => {
    const config = getLanguageConfig('javascript');
    expect(config.compile).toBeNull();
    expect(config.run.command).toBe('node');
  });

  it('should throw for unsupported language', () => {
    expect(() => getLanguageConfig('ruby')).toThrow('Unsupported language');
  });
});

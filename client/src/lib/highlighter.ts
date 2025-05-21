// Simple utility functions for code highlighting
// No external dependencies - pure regex-based highlighting

// Safely escape HTML to prevent XSS
const escapeHtml = (code: string): string => {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Language aliases mapping
const langMap: Record<string, string> = {
  "js": "javascript",
  "ts": "typescript",
  "py": "python", 
  "rb": "ruby",
  "sh": "bash",
  "shell": "bash",
  "cs": "csharp",
  "html": "markup",
  "xml": "markup",
  "c++": "cpp",
  "yml": "yaml",
  "md": "markdown",
};

/**
 * Simple code syntax highlighter using regex patterns
 */
export function highlightCode(code: string, language = "typescript"): string {
  if (!code) return "";
  
  // Clean up the language identifier
  const cleanLang = language?.toLowerCase().trim() || "text";
  
  // Map language aliases
  const lang = langMap[cleanLang] || cleanLang;
  
  // Common patterns for all languages
  const commonPatterns = [
    // Comments
    { regex: /(\/\/.*$)/gm, className: 'hljs-comment' },
    { regex: /(\/\*[\s\S]*?\*\/)/gm, className: 'hljs-comment' },
    { regex: /(#.*$)/gm, className: 'hljs-comment' },
    
    // Strings
    { regex: /("(?:\\.|[^"\\])*")/g, className: 'hljs-string' },
    { regex: /('(?:\\.|[^'\\])*')/g, className: 'hljs-string' },
    { regex: /(`(?:\\.|[^`\\])*`)/g, className: 'hljs-string' },
    
    // Numbers
    { regex: /\b(\d+(?:\.\d+)?)\b/g, className: 'hljs-number' },
  ];
  
  // Language-specific patterns
  const languagePatterns: Record<string, Array<{ regex: RegExp; className: string }>> = {
    javascript: [
      { regex: /\b(const|let|var|function|class|extends|return|if|else|for|while|switch|case|break|default|try|catch|finally|throw|async|await|new|this|typeof|instanceof|import|export|from|as|of|in)\b/g, className: 'hljs-keyword' },
      { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: 'hljs-literal' },
      { regex: /\b(Array|Object|String|Number|Boolean|Function|Symbol|Math|Date|RegExp|Map|Set|Promise|JSON)\b/g, className: 'hljs-built_in' },
      { regex: /\b([A-Z][a-zA-Z0-9_$]*)\b/g, className: 'hljs-class' },
      { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, className: 'hljs-function' },
    ],
    typescript: [
      { regex: /\b(const|let|var|function|class|extends|implements|interface|type|enum|namespace|return|if|else|for|while|switch|case|break|default|try|catch|finally|throw|async|await|new|this|typeof|instanceof|import|export|from|as|of|in|keyof|readonly|public|private|protected|static|abstract)\b/g, className: 'hljs-keyword' },
      { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, className: 'hljs-literal' },
      { regex: /\b(Array|Object|String|Number|Boolean|Function|Symbol|Math|Date|RegExp|Map|Set|Promise|JSON)\b/g, className: 'hljs-built_in' },
      { regex: /\b([A-Z][a-zA-Z0-9_$]*)\b/g, className: 'hljs-class' },
      { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, className: 'hljs-function' },
    ],
    python: [
      { regex: /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, className: 'hljs-keyword' },
      { regex: /\b(True|False|None)\b/g, className: 'hljs-literal' },
      { regex: /\b(print|len|range|int|str|list|dict|set|tuple|open|file|object|self)\b/g, className: 'hljs-built_in' },
      { regex: /\b([A-Z][a-zA-Z0-9_]*)\b/g, className: 'hljs-class' },
      { regex: /\b([a-z_][a-z0-9_]*)\s*\(/ig, className: 'hljs-function' },
    ],
    java: [
      { regex: /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)\b/g, className: 'hljs-keyword' },
      { regex: /\b(true|false|null)\b/g, className: 'hljs-literal' },
      { regex: /\b(System|String|Math|Object|Class|Exception|Thread|Override)\b/g, className: 'hljs-built_in' },
      { regex: /\b([A-Z][a-zA-Z0-9_]*)\b/g, className: 'hljs-class' },
      { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, className: 'hljs-function' },
    ],
  };
  
  // Combine applicable patterns
  const applicablePatterns = [...commonPatterns];
  
  // Add language-specific patterns if available
  if (languagePatterns[lang]) {
    applicablePatterns.push(...languagePatterns[lang]);
  }
  
  // First escape the code to prevent XSS
  let highlighted = escapeHtml(code);
  
  // Apply highlighting patterns
  applicablePatterns.forEach(({ regex, className }) => {
    highlighted = highlighted.replace(regex, match => 
      `<span class="${className}">${match}</span>`
    );
  });

  // Apply CSS for highlighting directly
  const style = document.createElement('style');
  if (!document.getElementById('code-highlight-styles')) {
    style.id = 'code-highlight-styles';
    style.textContent = `
      .hljs-comment { color: #6a9955; font-style: italic; }
      .hljs-string { color: #ce9178; }
      .hljs-number { color: #b5cea8; }
      .hljs-keyword { color: #569cd6; font-weight: bold; }
      .hljs-literal { color: #569cd6; }
      .hljs-built_in { color: #4ec9b0; }
      .hljs-class { color: #4ec9b0; }
      .hljs-function { color: #dcdcaa; }
      pre code { font-family: 'Consolas', 'Monaco', 'Courier New', monospace; }
    `;
    document.head.appendChild(style);
  }
  
  return highlighted;
}

/**
 * Add line numbers to highlighted code
 */
export function addLineNumbers(code: string): string {
  const lines = code.split('\n');
  let numberedCode = '';
  
  lines.forEach((line, i) => {
    numberedCode += `<span class="line-number">${i + 1}</span>${line}${i < lines.length - 1 ? '\n' : ''}`;
  });
  
  // Add CSS for line numbers
  const style = document.createElement('style');
  if (!document.getElementById('line-numbers-styles')) {
    style.id = 'line-numbers-styles';
    style.textContent = `
      .line-number {
        display: inline-block;
        width: 2em;
        color: #6e7681;
        text-align: right;
        margin-right: 1em;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }
  
  return numberedCode;
}

/**
 * Get a list of supported languages
 */
export function getSupportedLanguages(): string[] {
  return [
    'javascript',
    'typescript',
    'python',
    'java',
    'c',
    'cpp',
    'csharp',
    'go',
    'ruby',
    'rust',
    'bash',
    'html',
    'css',
    'json',
    'markdown',
    'sql',
    'xml',
    'yaml'
  ];
}
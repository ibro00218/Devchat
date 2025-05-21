// Simple utility for code highlighting without external dependencies
// This file replaces the Prism dependency

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

// Safely escape HTML to prevent XSS when highlighting fails
const escapeHtml = (code: string): string => {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Basic syntax highlighting with regex
export const highlightCode = (code: string, language = "typescript"): string => {
  if (!code) return "";
  
  // Clean up the language identifier
  const cleanLang = language.toLowerCase().trim();
  
  // Get the correct language identifier
  const lang = langMap[cleanLang] || cleanLang;
  
  // Common programming elements
  const patterns: { [key: string]: { regex: RegExp; className: string }[] } = {
    // Common for most languages
    common: [
      // Comments
      { regex: /(\/\/.*$)/gm, className: 'comment' },
      { regex: /(\/\*[\s\S]*?\*\/)/gm, className: 'comment' },
      { regex: /(#.*$)/gm, className: 'comment' },
      
      // Strings
      { regex: /("(?:\\.|[^"\\])*")/g, className: 'string' },
      { regex: /('(?:\\.|[^'\\])*')/g, className: 'string' },
      { regex: /(`(?:\\.|[^`\\])*`)/g, className: 'string' },
      
      // Numbers
      { regex: /\b(\d+(?:\.\d+)?)\b/g, className: 'number' },
      
      // Keywords (common)
      { regex: /\b(function|return|if|else|for|while|class|try|catch|new|this)\b/g, className: 'keyword' },
      
      // Function calls
      { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, className: 'function' },
    ],
    
    // JavaScript/TypeScript specific
    javascript: [
      { regex: /\b(const|let|var|async|await|import|export|from)\b/g, className: 'keyword' },
      { regex: /\b(true|false|null|undefined)\b/g, className: 'keyword' },
    ],
    typescript: [
      { regex: /\b(const|let|var|async|await|import|export|from|interface|type|enum)\b/g, className: 'keyword' },
      { regex: /\b(true|false|null|undefined)\b/g, className: 'keyword' },
    ],
    
    // Python specific
    python: [
      { regex: /\b(def|import|from|as|class|with|is|in|not|and|or|True|False|None)\b/g, className: 'keyword' },
      { regex: /\b(print|len|range|str|int|float|list|dict|tuple|set)\b/g, className: 'function' },
    ],
  };

  const applicablePatterns = [...(patterns.common || [])];
  
  // Add language-specific patterns if they exist
  if (patterns[lang]) {
    applicablePatterns.push(...patterns[lang]);
  }

  try {
    // Apply each pattern
    let highlighted = escapeHtml(code);
    applicablePatterns.forEach(({ regex, className }) => {
      highlighted = highlighted.replace(regex, match => `<span class="${className}">${match}</span>`);
    });
    
    // Add CSS classes for syntax highlighting
    const style = document.createElement('style');
    if (!document.getElementById('syntax-highlighting-styles')) {
      style.id = 'syntax-highlighting-styles';
      style.textContent = `
        .comment { color: #6a9955; }
        .string { color: #ce9178; }
        .number { color: #b5cea8; }
        .keyword { color: #569cd6; }
        .function { color: #dcdcaa; }
        pre { line-height: 1.5; }
        code { font-family: "Consolas", monospace; }
      `;
      document.head.appendChild(style);
    }
    
    return highlighted;
  } catch (error) {
    console.error("Failed to highlight code:", error);
    return escapeHtml(code);
  }
};

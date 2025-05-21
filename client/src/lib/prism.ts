import Prism from "prismjs";

// This simpler approach works better with Vite's bundling
import "prismjs/components/prism-markup";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-php";
import "prismjs/components/prism-markdown";

// Initialize Prism for client-side usage
if (typeof window !== "undefined") {
  window.Prism = window.Prism || Prism;
}

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

export const highlightCode = (code: string, language = "typescript"): string => {
  if (!code) return "";
  
  // Clean up the language identifier
  const cleanLang = language.toLowerCase().trim();
  
  // Get the correct language identifier
  const prismLang = langMap[cleanLang] || cleanLang;
  
  // Check if the language is supported
  if (!Prism.languages[prismLang]) {
    console.warn(`Language "${prismLang}" not available in Prism, defaulting to plain text`);
    return `<pre class="language-none">${escapeHtml(code)}</pre>`;
  }

  // Highlight the code with the appropriate language
  try {
    return Prism.highlight(code, Prism.languages[prismLang], prismLang);
  } catch (error) {
    console.error(`Error highlighting code for language "${prismLang}"`, error);
    return escapeHtml(code);
  }
};

export default Prism;

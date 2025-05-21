import Prism from "prismjs";

// Ensure Prism is properly loaded and initialized
if (typeof window !== "undefined") {
  window.Prism = window.Prism || Prism;
}

// Make sure basic languages are available
if (!Prism.languages.markup) {
  require("prismjs/components/prism-markup");
}
if (!Prism.languages.javascript) {
  require("prismjs/components/prism-javascript");
}
if (!Prism.languages.css) {
  require("prismjs/components/prism-css");
}

// Load all languages to ensure they're available
const loadLanguage = (language: string) => {
  try {
    require(`prismjs/components/prism-${language}`);
    return true;
  } catch (e) {
    console.warn(`Failed to load language: ${language}`);
    return false;
  }
};

// Preload common languages
const commonLanguages = [
  'javascript', 'typescript', 'jsx', 'tsx', 'css', 'python', 
  'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'sql', 'bash', 
  'json', 'markdown', 'yaml', 'php', 'ruby'
];

commonLanguages.forEach(loadLanguage);

export const highlightCode = (code: string, language = "typescript") => {
  if (!code) return "";
  
  // Clean up the language identifier
  const cleanLang = language.toLowerCase().trim();
  
  // Handle special cases
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
    "jsx": "jsx",
    "tsx": "tsx"
  };

  // Get the correct language identifier
  const prismLang = langMap[cleanLang] || cleanLang;
  
  // Try to load the language if it's not already loaded
  if (!Prism.languages[prismLang]) {
    loadLanguage(prismLang);
  }

  // Check if the language is loaded now
  if (!Prism.languages[prismLang]) {
    console.warn(`Language "${prismLang}" not available in Prism, defaulting to plain text`);
    // Just return formatted code without highlighting
    return code.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
  }

  // Highlight the code with the appropriate language
  try {
    return Prism.highlight(code, Prism.languages[prismLang], prismLang);
  } catch (error) {
    console.error(`Error highlighting code for language "${prismLang}"`, error);
    // Fallback to escaped plain text
    return code.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
  }
};

export default Prism;

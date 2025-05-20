import Prism from "prismjs";

// Ensure Prism is properly loaded
if (typeof window !== "undefined" && window.Prism === undefined) {
  window.Prism = Prism;
}

export const highlightCode = (code: string, language = "typescript") => {
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
  };

  // Get the correct language identifier
  const prismLang = langMap[cleanLang] || cleanLang;

  // Check if the language is loaded
  if (!Prism.languages[prismLang]) {
    console.warn(`Language "${prismLang}" not loaded in Prism, defaulting to markup`);
    return Prism.highlight(code, Prism.languages.markup, "markup");
  }

  // Highlight the code with the appropriate language
  try {
    return Prism.highlight(code, Prism.languages[prismLang], prismLang);
  } catch (error) {
    console.error(`Error highlighting code for language "${prismLang}"`, error);
    // Fallback to plain text
    return code;
  }
};

export default Prism;

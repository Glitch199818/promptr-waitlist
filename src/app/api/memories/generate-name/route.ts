import { NextResponse, type NextRequest } from "next/server";

// Smart name generation based on text analysis
// This mimics ChatGPT's auto-naming by analyzing the content
const generateSmartName = (text: string): string => {
  const trimmed = text.trim();
  if (!trimmed) return "Untitled Prompt";

  // Remove common prefixes
  let cleaned = trimmed
    .replace(/^(please|can you|could you|i need|help me|write|create|generate|make|do|show|explain|tell|give|provide)\s+/i, "")
    .replace(/\s+(please|thanks|thank you)[.!?]*$/i, "")
    .trim();

  // Extract first sentence or meaningful chunk
  const sentences = cleaned.split(/[.!?]\s+/).filter(s => s.length > 10);
  const firstSentence = sentences[0] || cleaned;

  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', 'they', 'them', 'their', 'there', 'here', 'where', 'when', 'what', 'which', 'who', 'whom', 'whose', 'why', 'how'
  ]);

  // Extract important words (filter stop words, keep meaningful ones)
  const words = firstSentence.split(/\s+/).filter(w => {
    const word = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    return word.length > 2 && !stopWords.has(word);
  });

  let name = "";

  // If it's a question, use the question as the name
  if (trimmed.includes("?")) {
    const questionMatch = trimmed.match(/(?:^|\n)([^.!?]*\?)/);
    if (questionMatch) {
      const question = questionMatch[1].trim();
      const questionWords = question.split(/\s+/).filter(w => {
        const word = w.toLowerCase().replace(/[^a-z0-9]/g, '');
        return word.length > 2 && !stopWords.has(word);
      });
      name = questionWords.slice(0, 8).join(" ");
    }
  }

  // If it contains code, try to extract function/class names
  if (!name && trimmed.match(/(?:function|class|def|const|let|var|async|export|import)\s+(\w+)/i)) {
    const codeMatch = trimmed.match(/(?:function|class|def|const|let|var|async|export|import)\s+(\w+)/i);
    if (codeMatch && codeMatch[1]) {
      let codeName = codeMatch[1];
      // Convert camelCase/PascalCase to Title Case
      codeName = codeName.replace(/([A-Z])/g, " $1").trim();
      codeName = codeName.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      name = codeName;
    }
  }

  // If we have action verbs, extract the action + object
  if (!name) {
    const actionVerbs = ['write', 'create', 'generate', 'make', 'build', 'design', 'develop', 'code', 'implement', 
                         'analyze', 'explain', 'summarize', 'review', 'fix', 'debug', 'optimize', 'improve', 'refactor',
                         'help', 'show', 'tell', 'give', 'provide', 'find', 'search', 'get', 'fetch', 'load', 'save'];
    for (const verb of actionVerbs) {
      const pattern = new RegExp(`${verb}\\s+(?:a|an|the)?\\s*([^.!?\\s]+(?:\\s+[^.!?\\s]+){0,4})`, 'i');
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        const object = match[1].trim();
        // Filter out very short or meaningless objects
        if (object.length > 3 && !stopWords.has(object.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
          name = `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${object}`;
          break;
        }
      }
    }
  }

  // Try to extract a topic/subject from common patterns
  if (!name) {
    // Pattern: "about X", "on X", "for X", "regarding X"
    const topicPatterns = [
      /(?:about|on|for|regarding|concerning|related to)\s+([^.!?]+?)(?:\s|$|,|\.)/i,
      /(?:topic|subject|theme|focus|discuss|talk)\s+(?:is|about|on)?\s*:?\s*([^.!?]+?)(?:\s|$|,|\.)/i
    ];
    
    for (const pattern of topicPatterns) {
      const match = cleaned.match(pattern);
      if (match && match[1]) {
        const topic = match[1].trim().split(/\s+/).slice(0, 5).join(" ");
        if (topic.length > 3) {
          name = topic;
          break;
        }
      }
    }
  }

  // Fallback: use important words from the text (but skip common prefixes)
  if (!name && words.length > 0) {
    // Skip first word if it's a common verb
    const commonPrefixes = ['write', 'create', 'make', 'do', 'get', 'show', 'tell', 'give', 'help'];
    let startIdx = 0;
    if (words.length > 0 && commonPrefixes.includes(words[0].toLowerCase())) {
      startIdx = 1;
    }
    name = words.slice(startIdx, startIdx + 5).join(" ");
  }

  // Final fallback: first few meaningful words (skip common starters)
  if (!name || name.length < 3) {
    const allWords = trimmed.split(/\s+/);
    const skipFirst = ['please', 'can', 'could', 'would', 'will', 'should', 'i', 'we', 'you'];
    let startIdx = 0;
    if (allWords.length > 0 && skipFirst.includes(allWords[0].toLowerCase())) {
      startIdx = 1;
    }
    const fallback = allWords.slice(startIdx, startIdx + 5).join(" ");
    name = fallback.length > 50 ? fallback.substring(0, 47) + "..." : fallback;
  }

  // Clean up and format
  name = name
    .replace(/\s+/g, " ")
    .replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, "")
    .trim();

  // Capitalize first letter of each word
  name = name.split(" ").map(word => {
    if (word.length === 0) return word;
    // Preserve acronyms (all caps)
    if (word === word.toUpperCase() && word.length > 1) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(" ");

  // Limit length
  if (name.length > 60) {
    name = name.substring(0, 57) + "...";
  }

  return name || "Untitled Prompt";
};

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { 
    status: 204, 
    headers: corsHeaders(req.headers.get("origin")) 
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const name = generateSmartName(text);

    return NextResponse.json({ name }, { 
      status: 200, 
      headers: corsHeaders(origin) 
    });
  } catch (err) {
    console.error("Error generating name:", err);
    return NextResponse.json(
      { error: "Failed to generate name" },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

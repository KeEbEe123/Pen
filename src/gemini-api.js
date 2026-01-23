const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.apiKey = null;
  }

  initialize(apiKey) {
    try {
      if (!apiKey) {
        console.warn('Gemini API key not provided. AI features will be disabled.');
        return false;
      }

      this.apiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      console.log('Gemini API initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error);
      return false;
    }
  }

  async detectClaims(text) {
    if (!this.model) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const prompt = `
        Analyze the following text and identify any factual claims, statistics, or statements that would benefit from citation or verification. 
        For each claim found, provide:
        1. The exact text of the claim
        2. The type of claim (statistical, factual, opinion, etc.)
        3. A confidence score (0-1) for how certain you are this needs verification
        4. A brief explanation of why this claim should be verified

        Text to analyze:
        "${text}"

        Please respond in JSON format with an array of claims:
        {
          "claims": [
            {
              "text": "exact claim text",
              "type": "statistical|factual|opinion|historical|scientific",
              "confidence": 0.85,
              "reason": "explanation of why this needs verification"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        return { claims: [] };
      }
    } catch (error) {
      console.error('Error detecting claims with Gemini:', error);
      throw error;
    }
  }

  async generateCitation(url, title, author = '', publishDate = '', format = 'APA') {
    if (!this.model) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const prompt = `
        Generate a properly formatted citation in ${format} style for the following source:
        
        URL: ${url}
        Title: ${title}
        Author: ${author || 'Unknown'}
        Publish Date: ${publishDate || 'n.d.'}
        
        Please provide only the citation text, properly formatted according to ${format} guidelines.
        If any information is missing, use appropriate placeholders (e.g., "n.d." for no date, "Unknown Author" if no author).
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating citation with Gemini:', error);
      throw error;
    }
  }

  async improveWriting(text, context = 'academic') {
    if (!this.model) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const prompt = `
        Please review and improve the following ${context} text for:
        1. Grammar and syntax
        2. Clarity and flow
        3. Academic tone (if applicable)
        4. Conciseness without losing meaning
        
        Original text:
        "${text}"
        
        Please provide:
        1. The improved version
        2. A brief explanation of the main changes made
        
        Format your response as JSON:
        {
          "improved_text": "the improved version",
          "changes_summary": "brief explanation of changes"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        return {
          improved_text: text,
          changes_summary: "Unable to process improvements"
        };
      }
    } catch (error) {
      console.error('Error improving writing with Gemini:', error);
      throw error;
    }
  }

  async summarizeContent(text, maxLength = 200) {
    if (!this.model) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const prompt = `
        Please provide a concise summary of the following text in approximately ${maxLength} words or less.
        Focus on the main points and key information that would be relevant for academic research.
        
        Text to summarize:
        "${text}"
        
        Summary:
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error summarizing content with Gemini:', error);
      throw error;
    }
  }

  async extractKeyTopics(text) {
    if (!this.model) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const prompt = `
        Analyze the following text and extract the main topics, themes, and keywords that would be useful for research organization and tagging.
        
        Text to analyze:
        "${text}"
        
        Please respond in JSON format:
        {
          "topics": ["topic1", "topic2", "topic3"],
          "keywords": ["keyword1", "keyword2", "keyword3"],
          "themes": ["theme1", "theme2"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        return {
          topics: [],
          keywords: [],
          themes: []
        };
      }
    } catch (error) {
      console.error('Error extracting topics with Gemini:', error);
      throw error;
    }
  }

  async checkFactualAccuracy(claim, context = '') {
    if (!this.model) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const prompt = `
        Please analyze the following claim for potential factual accuracy issues:
        
        Claim: "${claim}"
        Context: "${context}"
        
        Provide:
        1. An assessment of whether this claim appears to be factually accurate based on your knowledge
        2. Any red flags or concerns about the claim
        3. Suggestions for verification or additional sources to check
        4. A confidence level (low/medium/high) in your assessment
        
        Please respond in JSON format:
        {
          "assessment": "accurate|questionable|inaccurate|insufficient_info",
          "confidence": "low|medium|high",
          "concerns": ["concern1", "concern2"],
          "verification_suggestions": ["suggestion1", "suggestion2"],
          "explanation": "detailed explanation"
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError);
        return {
          assessment: "insufficient_info",
          confidence: "low",
          concerns: [],
          verification_suggestions: [],
          explanation: "Unable to process claim analysis"
        };
      }
    } catch (error) {
      console.error('Error checking factual accuracy with Gemini:', error);
      throw error;
    }
  }

  isInitialized() {
    return this.model !== null;
  }
}

module.exports = GeminiService;
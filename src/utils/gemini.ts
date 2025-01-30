import { GoogleGenerativeAI } from '@google/generative-ai';

export const analyzeNote = async (content: string, apiKey: string): Promise<{ summary: string; tags: string[]; categories: string[]; dueDate?: Date }> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze this note and provide:
1. A one-line summary (max 50 characters)
2. Relevant tags (max 6)
3. If this contains any meeting or task with time, extract the exact date and time
Note content: "${content}"

Format the response exactly like this:
Summary: [one line summary]
Tags: [tag1, tag2, tag3, tag4, tag5, tag6]
DateTime: [ISO date string or "none" if no date/time found]`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  const summaryMatch = text.match(/Summary: (.+)/);
  const tagsMatch = text.match(/Tags: (.+)/);
  const dateTimeMatch = text.match(/DateTime: (.+)/);

  const summary = summaryMatch?.[1] || '';
  const tags = tagsMatch?.[1].split(',').map(t => t.trim()).slice(0, 6) || [];
  const dateTimeStr = dateTimeMatch?.[1];
  
  let dueDate: Date | undefined;
  if (dateTimeStr && dateTimeStr !== 'none') {
    dueDate = new Date(dateTimeStr);
  }

  return { 
    summary: summary.substring(0, 50), 
    tags, 
    categories: [],
    dueDate
  };
};
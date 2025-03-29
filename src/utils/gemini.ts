import { GoogleGenerativeAI } from '@google/generative-ai';

export const analyzeNote = async (content: string, apiKey: string): Promise<{ 
  summary: string; 
  tags: string[]; 
  categories: string[]; 
  dueDate?: Date;
  venue?: string;
  author?: string;
}> => {
  if (!content.trim()) {
    throw new Error('Note content cannot be empty');
  }

  if (!apiKey.trim()) {
    throw new Error('API key is required');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this note and provide:
1. A one-line summary (max 50 characters)
2. Relevant tags (max 6)
3. If this contains any meeting or task with time, extract the exact date and time (assume timezone is IST/GMT+5:30)
4. If this is about a meeting or event, extract the venue
5. Try to identify who created or is responsible for this event/note
Note content: "${content}"

Format the response exactly like this:
Summary: [one line summary]
Tags: [tag1, tag2, tag3, tag4, tag5, tag6]
DateTime: [ISO date string or "none" if no date/time found]
Venue: [venue or "none" if not found]
Author: [author/organizer or "Unknown"]`;

    const result = await model.generateContent(prompt);
    if (!result) {
      throw new Error('No response received from Gemini API');
    }

    const response = await result.response;
    if (!response) {
      throw new Error('Empty response from Gemini API');
    }

    const text = response.text();
    if (!text) {
      throw new Error('Empty text in Gemini API response');
    }

    const summaryMatch = text.match(/Summary: (.+?)(?=\n|$)/);
    const tagsMatch = text.match(/Tags: (.+?)(?=\n|$)/);
    const dateTimeMatch = text.match(/DateTime: (.+?)(?=\n|$)/);
    const venueMatch = text.match(/Venue: (.+?)(?=\n|$)/);
    const authorMatch = text.match(/Author: (.+?)(?=\n|$)/);

    if (!summaryMatch || !tagsMatch) {
      throw new Error('Invalid response format from Gemini API: Missing required fields');
    }

    const summary = summaryMatch[1].trim();
    const tags = tagsMatch[1]
      .split(',')
      .map(t => t.trim())
      .filter(t => t && t !== '[' && t !== ']')
      .slice(0, 6);

    const dateTimeStr = dateTimeMatch?.[1]?.trim();
    const venue = venueMatch?.[1]?.trim();
    const author = authorMatch?.[1]?.trim();
    
    let dueDate: Date | undefined;
    if (dateTimeStr && dateTimeStr !== 'none') {
      try {
        // Handle relative dates like "tomorrow at 6 PM"
        if (dateTimeStr.toLowerCase().includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const timeMatch = dateTimeStr.match(/(\d{1,2})(?:\s*)?(?::|.)(?:\s*)?(\d{2})?\s*([AaPp][Mm])?/);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2] || '0');
            const meridiem = timeMatch[3]?.toUpperCase();
            
            if (meridiem === 'PM' && hours < 12) hours += 12;
            if (meridiem === 'AM' && hours === 12) hours = 0;
            
            tomorrow.setHours(hours, minutes, 0, 0);
            dueDate = tomorrow;
          }
        } else {
          // Try parsing as ISO string
          const parsedDate = new Date(dateTimeStr);
          if (!isNaN(parsedDate.getTime())) {
            dueDate = parsedDate;
          }
        }

        if (dueDate) {
          // Get user's timezone or default to IST
          const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (!userTimezone) {
            // If no timezone detected, assume IST (GMT+5:30)
            const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
            dueDate = new Date(dueDate.getTime() + istOffset);
          }
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        // If date parsing fails, don't set the dueDate
      }
    }

    return { 
      summary: summary.substring(0, 50), 
      tags: tags.length > 0 ? tags : ['note'],
      categories: [],
      dueDate,
      venue: venue && venue !== 'none' ? venue : undefined,
      author: author && author !== 'Unknown' ? author : undefined
    };
  } catch (error) {
    // Convert error to a proper Error object with message
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while analyzing the note';
    
    console.error('Error analyzing note:', errorMessage);
    
    // Return a basic analysis instead of failing completely
    return {
      summary: content.substring(0, 50),
      tags: ['note'],
      categories: [],
      dueDate: undefined,
      venue: undefined,
      author: undefined
    };
  }
};

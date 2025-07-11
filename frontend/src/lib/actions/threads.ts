'use server'

export const generateThreadName = async (message: string): Promise<string> => {
  try {
    // Default name in case the API fails
    const defaultName = message.trim().length > 50 
      ? message.trim().substring(0, 47) + "..." 
      : message.trim();
    
    // OpenAI API key should be stored in an environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key not found');
      return defaultName;
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com'; // Default to OpenAI API if base URL is not set
    const apiUrl = `${baseUrl}/v1/chat/completions`; // Append the path

    const response = await fetch(apiUrl, { // Use the constructed URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash-lite',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates extremely concise titles (2-4 words maximum) for chat threads based on the user\'s message. Respond with only the title, no other text or punctuation.'
          },
          {
            role: 'user',
            content: `Generate an extremely brief title (2-4 words only) for a chat thread that starts with this message: "${message}"`
          }
        ],
        max_tokens: 20,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return defaultName;
    }
    
    const data = await response.json();
    const generatedName = data.choices[0]?.message?.content?.trim();
    
    // Return the generated name or default if empty
    return generatedName || defaultName;
  } catch (error) {
    console.error('Error generating thread name:', error);
    // Fall back to using a truncated version of the message
    return message.trim().length > 50 
      ? message.trim().substring(0, 47) + "..." 
      : message.trim();
  }
}; 
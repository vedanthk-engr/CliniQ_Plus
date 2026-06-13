import { useState, useCallback } from 'react';

export const useSSEStream = () => {
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startStream = useCallback(async (url, payload = {}) => {
    setLoading(true);
    setError(null);
    setData('');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`SSE stream failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          buffer += chunk;

          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith('data: ')) {
              const content = cleanLine.substring(6);
              if (content === '[DONE]') {
                done = true;
                break;
              }
              
              // Standard stream accumulated text append
              // If it's a JSON string, we let the page handle parsing, or we output it directly.
              // For prose streaming (like explain buttons), it is raw text.
              // We'll decode if it's escaped quotes or double-newlines.
              let text = content;
              try {
                // If it's double quoted string chunk e.g. " hello"
                if (content.startsWith('"') && content.endsWith('"') && content.length > 1) {
                  text = JSON.parse(content);
                }
              } catch(e) {}
              
              setData((prev) => prev + text);
            }
          }
        }
      }
    } catch (err) {
      console.error("SSE Streaming error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, startStream, setData, setLoading };
};
export default useSSEStream;

import https  from 'https';
import process from 'process';

export const handler = async(event) => {
  const openAiUrl = 'https://api.openai.com/v1/completions';
  const openAiKey = JSON.parse(process.env.OPENAI_API_KEY).OPENAI_API_KEY;
  
  // Set the  API request options
  const options = {
    method: 'POST',
    headers: {
      'User-Agent': 'AWS Lambda',
      'Authorization': `Bearer ${openAiKey}`,
      'Content-Type': 'application/json'
    }
  };

  const data = JSON.stringify({
    prompt: `Write a synopsis for a Black Library novel about ${event.prompt}`,
    model: 'text-davinci-003',
    temperature: 0.7,
    max_tokens: 250,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1
  });

  // Make the API request
  const response = await new Promise((resolve, reject) => {
    const req = https.request(openAiUrl, options, (res) => {
      res.setEncoding('utf8');
      let body = ''
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const json = JSON.parse(body);
        resolve(json);
      });
    });
    req.on('error', (error) => {
      reject(error);
    });
    req.write(data);
    req.end();
  });
    
  return {
    statusCode: 200,
    body: response
  }
};

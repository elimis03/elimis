export default async function handler(req: any, res: any) {
  // CORS configuration for Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle pre-flight (OPTIONS) request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 1. Safe Body Parsing supporting auto-parsed bodies in Vercel
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    if (!body || typeof body !== 'object') {
      body = {};
    }

    const { movieNm, keywords } = body;
    if (!movieNm || !keywords || !Array.isArray(keywords) || keywords.length !== 3) {
      res.status(400).json({ error: '영화 제목과 정확히 3개의 키워드가 필요합니다.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ 
        error: '서버에 GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. Vercel Project Settings > Environment Variables에서 등록해 주세요.' 
      });
      return;
    }

    // 2. Direct REST Fallback call to Gemini API
    // Extremely robust as it avoids package resolution or bundle errors on Vercel Node runtime
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const prompt = `영화 "${movieNm}"을 관람한 뒤에 남겨진 흥미롭고 감성적인 감상평을 작성해주세요.
반드시 제공된 3개의 핵심 키워드 [${keywords.join(', ')}]가 문장 내에 매우 자연스럽고 유기적으로 포함되어야 합니다.
감상평은 3~5줄 분량의 품격 있고 몰입감 있는 한국어 톤앤매너로 작성하여 신선한 인상을 주도록 디자인해주세요.`;

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'aistudio-build'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Gemini API Error: Status ${apiResponse.status} - ${errorText}`);
    }

    const responseData = await apiResponse.json();
    const candidateText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Gemini API 응답에서 감상평 텍스트를 파싱할 수 없습니다.');
    }

    res.status(200).json({ comment: candidateText });
  } catch (error: any) {
    console.error('Error in /api/generate-comment:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

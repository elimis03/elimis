import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  try {
    const { movieNm, keywords } = req.body;
    if (!movieNm || !keywords || !Array.isArray(keywords) || keywords.length !== 3) {
      res.status(400).json({ error: '영화 제목과 정확히 3개의 키워드가 필요합니다.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: '서버에 GEMINI_API_KEY가 설정되지 않았습니다. AI Studio Secrets 패널에서 등록해주세요.' });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `영화 "${movieNm}"을 관람한 뒤에 남겨진 흥미롭고 감성적인 감상평을 작성해주세요.
반드시 제공된 3개의 핵심 키워드 [${keywords.join(', ')}]가 문장 내에 매우 자연스럽고 유기적으로 포함되어야 합니다.
감상평은 3~5줄 분량의 품격 있고 몰입감 있는 한국어 톤앤매너로 작성하여 신선한 인상을 주도록 디자인해주세요.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.status(200).json({ comment: response.text });
  } catch (error: any) {
    console.error('Error in /api/generate-comment:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

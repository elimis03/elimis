export default async function handler(req: any, res: any) {
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'date query parameter (YYYYMMDD) is required' });
      return;
    }
    
    const apiKey = process.env.KOBIS_API_KEY || '2375f106fa512b6b733e0c377819d9f9';
    const kobisUrl = `http://kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json?key=${apiKey}&targetDt=${date}`;
    
    console.log(`Fetching Daily Box Office for targetDt=${date}...`);
    const response = await fetch(kobisUrl);
    if (!response.ok) {
      throw new Error(`Kobis API error: ${response.statusText}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in /api/boxoffice:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

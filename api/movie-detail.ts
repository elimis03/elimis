export default async function handler(req: any, res: any) {
  try {
    const { movieCd } = req.query;
    if (!movieCd || typeof movieCd !== 'string') {
      res.status(400).json({ error: 'movieCd query parameter is required' });
      return;
    }

    const apiKey = process.env.KOBIS_API_KEY || '2375f106fa512b6b733e0c377819d9f9';
    const kobisUrl = `http://www.kobis.or.kr/kobisopenapi/webservice/rest/movie/searchMovieInfo.json?key=${apiKey}&movieCd=${movieCd}`;

    console.log(`Fetching Movie Detail for movieCd=${movieCd}...`);
    const response = await fetch(kobisUrl);
    if (!response.ok) {
      throw new Error(`Kobis API error: ${response.statusText}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in /api/movie-detail:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

// 이 파일은 Netlify 서버에서만 실행됩니다.
// 사용자의 브라우저에는 절대 노출되지 않으므로 API 키를 안전하게 보관할 수 있습니다.

exports.handler = async function (event, context) {
  // POST 요청이 아닌 경우 에러 처리
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Netlify 환경변수에서 API 키를 안전하게 가져옵니다.
    // process.env.GOOGLE_API_KEY 이름은 Netlify 설정과 일치해야 합니다.
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      throw new Error("API 키가 서버에 설정되지 않았습니다.");
    }
    
    // 클라이언트(index.html)에서 보낸 요청 데이터를 파싱합니다.
    const requestBody = JSON.parse(event.body);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // Google AI 서버로 요청을 전달합니다.
    const fetch = (await import('node-fetch')).default;
    const googleResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!googleResponse.ok) {
        const errorBody = await googleResponse.text();
        console.error("Google AI API Error:", errorBody);
        return {
            statusCode: googleResponse.status,
            body: JSON.stringify({ error: 'Google AI API에서 오류가 발생했습니다.' }),
        };
    }

    const data = await googleResponse.json();

    // 받은 결과를 다시 클라이언트(index.html)로 전달합니다.
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('서버 함수 에러:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '서버 내부 오류가 발생했습니다.' }),
    };
  }
};

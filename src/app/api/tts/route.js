import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, voiceName = 'te-IN-Standard-A' } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_TTS_API_KEY is not configured on the server' }, { status: 500 });
    }

    const googleTtsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    const response = await fetch(googleTtsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'te-IN', name: voiceName },
        audioConfig: { 
            audioEncoding: 'MP3',
            speakingRate: 0.90, // Slightly slower for better comprehension
            pitch: -2.0 // Slightly deeper
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google TTS Error:', errorData);
      return NextResponse.json({ error: 'Failed to synthesize speech', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    
    // Return the base64 encoded audio content
    return NextResponse.json({ audioContent: data.audioContent });

  } catch (error) {
    console.error('TTS Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

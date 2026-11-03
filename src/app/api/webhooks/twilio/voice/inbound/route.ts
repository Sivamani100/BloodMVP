import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/server/env';

export async function POST(req: NextRequest) {
  const env = getEnv();

  // Inbound TwiML Greeting & Blood Group Keypad Selection
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi" language="en-IN">
    Welcome to the Blood Emergency Helpline. We locate verified blood banks and alert compatible volunteer donors immediately.
  </Say>
  <Gather numDigits="1" action="/api/webhooks/twilio/voice/inbound/step?s=group" method="POST" timeout="8">
    <Say voice="Polly.Aditi" language="en-IN">
      Please select the patient's blood group.
      Press 1 for O Positive.
      Press 2 for O Negative.
      Press 3 for A Positive.
      Press 4 for B Positive.
      Press 5 for all other blood groups.
    </Say>
  </Gather>
  <Say voice="Polly.Aditi" language="en-IN">
    We did not receive any input. Please call back anytime or message our WhatsApp helpline. Goodbye.
  </Say>
  <Hangup/>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}


import 'dotenv/config';

if (process.env.RESEND_API_KEY) {
  console.log(
    'RESEND_API_KEY is present (Length: ' +
      process.env.RESEND_API_KEY.length +
      ')',
  );
} else {
  console.error('RESEND_API_KEY is MISSING from process.env');
}

import * as React from 'react';

interface VerificationLinkTemplateProps {
  userName: string;
  verificationLink: string;
}

export const VerificationLinkTemplate: React.FC<
  VerificationLinkTemplateProps
> = ({ userName, verificationLink }) => (
  <div
    style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      color: '#333',
      maxWidth: '600px',
      margin: '0 auto',
    }}
  >
    <h1 style={{ color: '#000', fontSize: '24px', marginBottom: '16px' }}>
      Verify your email address
    </h1>
    <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '24px' }}>
      Hi <strong>{userName}</strong>,
    </p>
    <p style={{ fontSize: '16px', lineHeight: '1.5', marginBottom: '24px' }}>
      Please verify your email address by clicking the button below. This
      ensures your account is secure and allows you to access all features.
    </p>
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <a
        href={verificationLink}
        style={{
          backgroundColor: '#000',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
        }}
      >
        Verify Email
      </a>
    </div>
    <p
      style={{
        fontSize: '14px',
        color: '#666',
        marginTop: '32px',
        borderTop: '1px solid #eee',
        paddingTop: '16px',
      }}
    >
      If you didn&apos;t request this verification, you can safely ignore this
      email.
    </p>
  </div>
);

export default VerificationLinkTemplate;

import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface InvitationEmailTemplateProps {
  inviterName: string;
  workspaceName: string;
  joinLink: string;
}

export const InvitationEmailTemplate: React.FC<
  InvitationEmailTemplateProps
> = ({ inviterName, workspaceName, joinLink }) => (
  <Html>
    <Head />
    <Preview>Join {workspaceName} on Prompt Version Control</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Workspace Invitation</Heading>
        <Text style={text}>Hello!</Text>
        <Text style={text}>
          <strong>{inviterName}</strong> has invited you to join the workspace{' '}
          <strong>{workspaceName}</strong> on Prompt Version Control.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={joinLink}>
            Join Workspace
          </Button>
        </Section>
        <Text style={text}>
          This invitation will expire in 7 days. If you were not expecting this
          invitation, you can ignore this email.
        </Text>
        <Text style={footer}>Prompt Version Control Team</Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#000000',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#000000',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#fff',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#aaaaaa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const buttonContainer = {
  padding: '27px 0 27px',
};

const button = {
  backgroundColor: '#fff',
  borderRadius: '3px',
  fontWeight: '600',
  color: '#000',
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '11px 23px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '26px',
  marginTop: '40px',
};

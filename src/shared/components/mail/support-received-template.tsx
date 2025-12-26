import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from '@react-email/components';

interface SupportReceivedEmailTemplateProps {
  email: string;
  category: string;
  ticketId: string;
  messageSnippet: string;
}

export const SupportReceivedEmailTemplate: React.FC<
  SupportReceivedEmailTemplateProps
> = ({ category, ticketId, messageSnippet }) => (
  <Html>
    <Head />
    <Preview>We received your support request (Ticket #{ticketId})</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Support Request Received</Heading>
        <Text style={text}>Hello,</Text>
        <Text style={text}>
          Thank you for contacting Prompt Version Control Support. We have
          received your request regarding <strong>{category}</strong>.
        </Text>
        <Section style={box}>
          <Text style={paragraph}>
            <strong>Ticket ID:</strong> {ticketId}
            <br />
            <strong>Issue:</strong> {messageSnippet}
          </Text>
        </Section>
        <Text style={text}>
          Our team typically responds within 3 business days. You will receive a
          reply directly to this email address.
        </Text>
        <Text style={footer}>Prompt Version Control Support Team</Text>
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

const box = {
  padding: '20px',
  backgroundColor: '#111',
  borderRadius: '5px',
  border: '1px solid #333',
  marginBottom: '24px',
};

const paragraph = {
  color: '#cccccc',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '26px',
  marginTop: '40px',
};

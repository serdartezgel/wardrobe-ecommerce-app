import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "32px",
  borderRadius: "8px",
  maxWidth: "500px",
  margin: "40px auto",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

const headingStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "700",
  textAlign: "center",
  color: "#111111",
  marginBottom: "20px",
};

const textStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "22px",
  color: "#333333",
};

const buttonContainer: React.CSSProperties = {
  textAlign: "center",
  marginTop: "30px",
  marginBottom: "30px",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#000000",
  color: "#ffffff",
  padding: "12px 24px",
  fontSize: "15px",
  fontWeight: 600,
  borderRadius: "6px",
  textDecoration: "none",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#888888",
  textAlign: "center",
  marginTop: "30px",
};

const VerificationEmail = ({
  url,
  username,
}: {
  url: string;
  username: string;
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your Wardrobe account</Preview>

      <Body style={{ backgroundColor: "#f4f4f5", margin: 0, padding: "24px" }}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Verify your email address</Heading>

          <Text style={textStyle}>
            Hi <strong>{username}</strong>, thank you for creating an account at
            <strong> Wardrobe</strong>. Please verify your email address to
            continue.
          </Text>

          <Section style={buttonContainer}>
            <Button href={url} style={buttonStyle}>
              Verify Email
            </Button>
          </Section>

          <Text style={textStyle}>
            If the button doesn’t work, copy and paste this link into your
            browser:
          </Text>

          <Text style={{ ...textStyle, wordBreak: "break-all", fontSize: 13 }}>
            {url}
          </Text>

          <Text style={footerText}>
            © {new Date().getFullYear()} Wardrobe — All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default VerificationEmail;

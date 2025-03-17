# Security Policy

## Supported Versions

This section shows which versions of the AI Chatbot Interface are currently supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

We take the security of the AI Chatbot Interface seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report a Vulnerability

If you believe you've found a security vulnerability in our project, please follow these steps:

1. **Do not** disclose the vulnerability publicly on GitHub Issues, Discord, or any other public forum.
2. Email your findings to me [dan.pertu@gmail.com](dan.pertu@gmail.com). If you don't receive a response within 48 hours, please follow up.
3. Include the following information in your report:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Any potential solutions you may have identified

### What to Expect

- **Initial Response**: We aim to acknowledge receipt of your vulnerability report within 48 hours.
- **Updates**: We will provide updates on the progress of resolving the vulnerability at least once a week.
- **Resolution Timeline**: Depending on the severity and complexity of the vulnerability, we aim to resolve issues within 90 days.
- **Credit**: If you would like, we will publicly acknowledge your responsible disclosure when we release a fix.

## Security Best Practices for Users

### API Key Security

- Never commit your OpenRouter API key to public repositories.
- Update the `config.js` file with your API key only on your local development environment.
- Consider using environment variables for API keys in production environments.

### Local Storage Security

This application uses local storage to save conversation history. Please be aware:
- Sensitive information stored in conversations will persist on your device.
- Local storage is not encrypted and could potentially be accessed by malware.
- Regular clearing of browser data will remove your conversation history.

## Known Security Considerations

### Client-Side Application

This is a client-side application with the following security implications:
- All processing happens in the user's browser.
- No server-side validation of requests is performed before they reach the OpenRouter API.
- API calls are made directly from the user's browser.

### Third-Party API Usage

- This application sends user data to third-party AI providers through OpenRouter.
- Users should review the OpenRouter privacy policy and terms of service.
- The security and privacy of your conversation data is subject to the policies of OpenRouter and the AI providers they utilize.

## Security Updates

Security updates will be released as new versions in the GitHub repository. To stay protected:
- Regularly check for new releases
- Update to the latest supported version
- Subscribe to project releases for notifications

## Code of Conduct

We expect all project participants to adhere to our Code of Conduct when reporting security issues or interacting with the project maintainers.

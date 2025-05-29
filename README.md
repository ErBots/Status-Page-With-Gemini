# 🌐 API Service Status Page

A modern and responsive status page designed to monitor the health of various APIs.

**Built with**: Plain HTML, Tailwind CSS, and JavaScript (with Gemini API integration)

## ✨ Key Features

- **Modern & Responsive Design**: Attractive and functional across various screen sizes
- **Real-time Monitoring**: Checks status, response code, and response time
- **API Categories**: Endpoints grouped by category
- **Overall Status Indicator**: Clear system health banner
- **AI Assistance (Gemini API)**:
  - Endpoint explanations
  - Error troubleshooting help
  - Multilingual support (ID/EN)
- **Report Issue Button**: Direct link to GitHub Issues
- **"Load More" Feature**: Progressive loading for better performance
- **Auto-Refresh**: Updates every 5 minutes

## 🚀 Live Demo

[**Live Demo →**](https://er-api.biz.id/status)

## 🛠️ Installation

```bash
git clone https://github.com/YourGitHubUsername/status-page-with-gemini.git
cd status-page-with-gemini
```

## ⚙️ Configuration

Set your variables in `index.html`:

```javascript
const API_BASE_URL = "https://er-api.biz.id";
const GITHUB_REPO_USER = "ErBots";
const GITHUB_REPO_NAME = "status-page-with-gemini";
const geminiApiKey = ""; // Your Gemini API Key
```

## Gemini API Key Configuration

To enable AI features, you need to obtain an API Key from Google Gemini and insert it into the code.

****Important:****
For static deployments like this, your API Key will be visible on the client-side. Consider the security implications if your API Key has sensitive access.

Obtain your API Key from Google AI Studio: https://aistudio.google.com/app/apikey

**Find the following line in index.html and replace "" with your API Key:**

```js
const geminiApiKey = ""; // Insert your Gemini API Key here
```

## ⚠️ Important Notes

- **CORS Limitations**: Requires backend proxy for external services
- **Security Note**: Gemini API key will be visible client-side

## 🚀 Deployment Options

### Vercel

Click the button to clone this repository and deploy it on Vercel:

[![](https://vercel.com/button)](https://vercel.com/new/clone?s=https%3A%2F%2Fgithub.com%2Ferbots%2Fstatus-page-with-gemini&showOptionalTeamCreation=false) ****THIS IS NOT TESTED YET****

### GitHub Pages

1. Go to Repository Settings → Pages
2. Select main branch and root directory "/"
3. Save and wait for deployment

## 🤝 Contributing

Contributions are highly appreciated! If you have suggestions, bug fixes, or new features, please open an issue or submit a pull request

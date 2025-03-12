export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>ConvoAI - AI-Powered Communication Platform</title>
        <meta
          name="description"
          content="AI-powered conversation environment for people with autism to improve communication skills"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };

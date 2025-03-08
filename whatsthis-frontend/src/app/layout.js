import '../styles/globals.css';
import { UserProvider } from '../context/UserContext';
import ClientLayout from './ClientLayout';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>What's This?</title>
        <meta name="description" content="A platform for sharing and discovering interesting artifacts" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-900 text-white min-h-screen">
        <UserProvider>
          <ClientLayout>
            {children}
          </ClientLayout>
        </UserProvider>
      </body>
    </html>
  );
}

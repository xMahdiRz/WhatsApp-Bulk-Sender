# 📱 WhatsApp Sender Frontend

A **modern web application** built with **Next.js** for managing and sending WhatsApp messages with ease.

---

## 🚀 Tech Stack

| Category             | Tech                                             |
|----------------------|--------------------------------------------------|
| **Framework**        | Next.js 15.2.4                                   |
| **Language**         | TypeScript                                       |
| **Styling**          | Tailwind CSS                                     |
| **UI Components**    | Radix UI                                         |
| **State Management** | React Hooks                                      |
| **Forms**            | React Hook Form + Zod for validation             |
| **HTTP Client**      | Axios                                            |
| **Authentication**   | NextAuth.js                                      |
| **i18n**             | next-intl                                        |
| **Charts**           | Recharts                                         |
| **Date Handling**    | date-fns                                         |
| **CSV Parsing**      | PapaParse                                        |

---

## 📦 Prerequisites

- Node.js `v18` or higher  
- `npm` or `yarn` package manager

---

## 🛠 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/whatsapp-sender-frontend.git
   cd whatsapp-sender-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --force
   # or
   yarn install
   ```

3. **Configure environment variables**  
   Create a `.env` file in the root directory and add the following:

   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:5228"

   # Authentication
   NEXTAUTH_SECRET="your-secret-key-here"
   JWT_SECRET="your-jwt-secret-key-here"
   CLIENT_REDIRECT_URL="http://localhost:3000"

   # WhatsApp Integration
   WHATSAPP_TOKEN="your-whatsapp-token-here"

   # Image Upload
   NEXT_PUBLIC_IMAGE_UPLOAD_URL="https://api.imgbb.com/1/upload"
   NEXT_PUBLIC_IMGBB_API_KEY="your-imgbb-api-key-here"
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Visit the app**  
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧰 Available Scripts

| Script          | Description                       |
|-----------------|-----------------------------------|
| `npm run dev`   | Start the development server      |
| `npm run build` | Build the app for production      |
| `npm run start` | Run the production server         |
| `npm run lint`  | Run ESLint for code quality       |

---

## 📁 Project Structure

```
project/
├── src/              # Application source code
├── public/           # Static assets
├── messages/         # i18n translation files
├── components/       # Reusable UI components
├── app/              # Next.js App Router directory
└── types/            # TypeScript type definitions
```

---

## ✨ Features

- ✅ Modern, responsive UI with Tailwind CSS  
- 🌍 Internationalization support  
- 🔒 Secure authentication via NextAuth.js  
- 📋 Form handling with advanced validation  
- 📈 Data visualization with Recharts  
- 📁 Image and file uploads  
- 📄 CSV import/export support  
- 🔄 Real-time updates for messaging

---

## 🤝 Contributing

1. Fork the repository  
2. Create your feature branch  
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes  
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to GitHub  
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request and let's build together 🚀

---

## 📄 License

Licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for full details.

---
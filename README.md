# Longhorn Exchange 🤘

## Your Official UT Austin Marketplace - Powered by Cloud Computing!

Longhorn Exchange is a dedicated online marketplace built exclusively for UT Austin students, leveraging advanced cloud computing technologies for seamless performance and scalability. Buy, sell, and trade textbooks, furniture, electronics, and more with your fellow Longhorns safely and easily.

---

## ☁️ Cloud-First Architecture

This application is built entirely on cloud infrastructure, primarily through the **Base44 platform**, ensuring high availability, automatic scaling, and enterprise-grade security:

### **Backend as a Service (BaaS)**
- **Cloud Database**: All entities (Listings, Users, Trades, Messages) are stored in managed cloud databases with automatic scaling and backup
- **Authentication**: Secure user management with Google OAuth integration, handled entirely in the cloud
- **File Storage**: Images and uploads stored in cloud-based object storage with global CDN distribution

### **Serverless Computing**
- **Functions**: All backend logic runs as serverless functions that automatically scale based on demand
- **Zero Infrastructure Management**: No servers to provision, maintain, or monitor
- **Pay-per-use**: Only pay for actual compute time used

### **Cloud Integrations**
- **AI Services**: OpenAI integration for smart suggestions and content moderation
- **Email Services**: Cloud-based email delivery for notifications
- **Image Processing**: Cloud-powered image analysis and optimization
- **Voice Processing**: Serverless voice-to-text conversion for hands-free search

---

## ✨ Features

*   **Seamless Listing Creation**: Easily list your items for sale with intuitive forms, AI-powered title, category, and price suggestions based on your uploaded images.
*   **Smart Search & Browse**: Efficiently find items using a powerful search bar, advanced filters (category, condition, price range), and sorting options.
*   **Intuitive Trading System**: Propose trades for items you want by offering your own listings, with clear options to accept, decline, or delete trade requests.
*   **Secure Meetup Locations**: Discover and navigate to recommended safe meetup spots on and around the UT Austin campus, complete with safety ratings and features.
*   **Direct Contact & In-App Communication**: Connect with sellers directly through secure contact requests, revealing phone numbers only when approved.
*   **Personalized Profiles**: Manage your listings, track your sales/purchases, and update your profile information.
*   **Content Moderation**: Listings are automatically checked for compliance with campus policies and community guidelines, ensuring a safe environment for everyone.
*   **Voice Assistant**: A hands-free way to search for listings using natural language commands.
*   **Responsive Design**: A beautiful and fully functional experience on both desktop and mobile devices.

---

## 🛠️ Technologies Used

### **Frontend**
*   **React**: Frontend framework for building the user interface
*   **Tailwind CSS**: Utility-first CSS framework for rapid styling
*   **shadcn/ui**: Reusable UI components built with Tailwind CSS and React
*   **Lucide React**: Icon library for a consistent visual language

### **Cloud Infrastructure**
*   **Base44 Platform**: Complete cloud backend solution providing:
  - Managed database with automatic scaling
  - Serverless function execution
  - User authentication and management
  - File storage and CDN delivery
  - API gateway and routing
*   **Deno Runtime**: Serverless functions for backend logic (complianceCheck, searchByVoice, demandForecasting, photogrammetry)
*   **OpenAI API**: Cloud-based AI services for content moderation and smart suggestions
*   **Cloud Storage**: Scalable object storage for images and file uploads

### **Development Tools**
*   **date-fns**: For robust date manipulation and formatting
*   **Vite**: Fast build tool and development server

---

## 🚀 Getting Started

This project leverages cloud computing for zero-configuration deployment and development:

### **Option 1: Cloud Development (Recommended)**
1. **Access on Base44**: Log in to your Base44 account and create a new application or import this project
2. **Automatic Setup**: The platform handles all dependencies, environment setup, and cloud infrastructure
3. **Instant Deployment**: Your app is immediately available with global CDN distribution

### **Option 2: Local Development**
```bash
# Clone the repository
git clone https://github.com/varundataquest/UT-Marketplace.git
cd UT-Marketplace

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Environment Configuration**
Cloud-based features require API keys managed securely in the Base44 workspace:
- `OPENAI_API_KEY`: For AI-powered suggestions and content moderation
- `GOOGLE_OAUTH_CLIENT_ID`: For secure user authentication
- Additional keys are automatically managed by the Base44 platform

---

## 💡 Usage

*   **Browse**: Explore available listings by navigating to the "Browse" page from the top navigation bar. Use the search and filter options to narrow down your choices.
*   **Sell**: To list an item, click "Sell" in the navigation. You'll be guided through the process, including uploading images and providing item details.
*   **Trade**: On a listing detail page, if the item is not yours, you'll see a "Trade" button. Click it to propose a trade by offering one of your own listed items. Manage your trades on the "Trades" page.
*   **Campus Map**: Find safe meetup locations on campus by visiting the "Campus Map" page.

---

## ☁️ Cloud Benefits

*   **Global Availability**: Your app is served from edge locations worldwide for optimal performance
*   **Automatic Scaling**: Handles traffic spikes without manual intervention
*   **Built-in Security**: Enterprise-grade security with automatic updates and monitoring
*   **Cost Efficiency**: Pay only for resources used, with automatic optimization
*   **Zero Maintenance**: No server management, updates, or infrastructure concerns

---

## 🤝 Contributing

Contributions are welcome! If you find a bug or have an idea for an improvement, please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---

## 📞 Contact

For any questions or support, please open an issue in this repository.

**Hook 'em Horns! 🤘**

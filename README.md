# Longhorn Exchange 🤘

## Your Official UT Austin Marketplace!

Longhorn Exchange is a dedicated online marketplace built exclusively for UT Austin students. Buy, sell, and trade textbooks, furniture, electronics, and more with your fellow Longhorns safely and easily. Our platform is designed to foster a secure and efficient trading environment within the campus community.

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

*   **React**: Frontend framework for building the user interface.
*   **Tailwind CSS**: Utility-first CSS framework for rapid styling.
*   **shadcn/ui**: Reusable UI components built with Tailwind CSS and React.
*   **Lucide React**: Icon library for a consistent visual language.
*   **Base44 Platform**: Powers the backend, user management, authentication, entity persistence (database), and serverless functions.
*   **Deno**: Runtime for backend serverless functions (e.g., `complianceCheck`, `searchByVoice`, `demandForecasting`, `photogrammetry`).
*   **OpenAI**: Utilized for AI suggestions during listing creation and content moderation.
*   **date-fns**: For robust date manipulation and formatting.

---

## 🚀 Getting Started

This project is built on the Base44 platform. To run and develop this application:

1.  **Clone the Repository (Optional)**: While development is primarily done within the Base44 workspace, you can clone this repository for local code inspection or version control.
    ```bash
    git clone https://github.com/your-username/longhorn-exchange.git
    cd longhorn-exchange
    ```
2.  **Access on Base44**: Log in to your Base44 account and create a new application or import this project. The platform will handle all the necessary dependencies and environment setup.
3.  **Environment Variables/Secrets**: Some features (like AI suggestions and content moderation) require API keys. These are managed securely within the Base44 workspace settings. If you're running locally via the Base44 CLI, ensure your `.env` file is configured with the necessary keys (e.g., `OPENAI_API_KEY`).

---

## 💡 Usage

*   **Browse**: Explore available listings by navigating to the "Browse" page from the top navigation bar. Use the search and filter options to narrow down your choices.
*   **Sell**: To list an item, click "Sell" in the navigation. You'll be guided through the process, including uploading images and providing item details.
*   **Trade**: On a listing detail page, if the item is not yours, you'll see a "Trade" button. Click it to propose a trade by offering one of your own listed items. Manage your trades on the "Trades" page.
*   **Campus Map**: Find safe meetup locations on campus by visiting the "Campus Map" page.

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

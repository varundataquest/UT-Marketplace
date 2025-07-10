# Longhorn Exchange: A Scalable Campus Marketplace Solution
# Link to App: https://app--longhorn-exchange-2e180a2a.base44.app/
## Technical Overview

Longhorn Exchange is a full-stack, cloud-native marketplace application designed for the UT Austin student community. It leverages a modern Jamstack-inspired architecture, separating the frontend UI from a highly scalable, serverless backend. The application primarily utilizes the Base44 platform for its Backend-as-a-Service (BaaS) capabilities, encompassing data persistence, authentication, file storage, and integrated services, augmented by custom serverless functions deployed on Deno Deploy.

## Architecture

The application follows a distributed architecture, comprising three main logical tiers:

1.  **Frontend (Client-Side Application):**
    *   Built with **React**, providing a dynamic and responsive user interface.
    *   Utilizes **React Router DOM** for client-side routing.
    *   Relies on **Shadcn/ui** components for a consistent and accessible design system, styled with **Tailwind CSS**.
    *   Interacts with the Base44 platform SDK (`@base44/sdk`) for direct entity access and user authentication, and consumes custom serverless functions via HTTP.

2.  **Base44 Platform (Managed Backend Services):**
    *   **Entities (Data Layer):** JSON Schema-defined data models (e.g., `Listing`, `User`, `Trade`, `Message`, `ContactRequest`) are persisted in a managed PostgreSQL database. Row-Level Security (RLS) is automatically enforced based on defined schemas, ensuring data isolation and access control at the database level (e.g., `rls.write` policies for `User` entity).
    *   **Authentication & Authorization:** Handles user identity via Google OAuth, session management, and role-based access (`admin`/`user`).
    *   **File Storage:** Provides secure cloud storage for uploaded assets (e.g., listing images) with public URLs.
    *   **Core Integrations:** Offers pre-built integrations to external APIs (e.g., LLM invocation, file upload, email sending) as managed serverless endpoints.

3.  **Serverless Functions (Deno Deploy):**
    *   Custom business logic requiring external API calls or complex processing is encapsulated in **Deno Deploy** functions (JavaScript/TypeScript).
    *   These functions are deployed to a global edge network, minimizing latency and providing automatic scaling.
    *   They are exposed as HTTP handlers (`Deno.serve`) and are secured by Base44's authentication mechanism, allowing frontend clients to invoke them securely.
    *   Leverages Deno's native Web APIs (`fetch`, `Request`, `Response`) and supports `npm:` specifiers for external dependencies.

**Data Flow Example (Listing Creation with AI/Compliance):**
1.  **Frontend (CreateListing.jsx):** User inputs listing details, uploads images.
2.  **Image Upload (`@/integrations/Core/UploadFile`):** Frontend invokes Base44's `UploadFile` integration, sending the file directly to cloud storage. A URL is returned.
3.  **AI Suggestion (`@/integrations/Core/InvokeLLM`):** If an image is uploaded, frontend may call `InvokeLLM` with the image URL and a prompt for title/category/price suggestions. This integration handles the LLM interaction (e.g., OpenAI's GPT models).
4.  **Compliance Check (`functions/complianceCheck.js`):** Before final submission, frontend calls the custom `complianceCheck` Deno Deploy function, passing listing text and image URLs. This function, in turn, interacts with third-party moderation APIs (e.g., OpenAI Moderation API, internal campus policy checks) to determine content appropriateness.
5.  **Entity Creation (`@/entities/Listing.create`):** If compliance is passed, the frontend invokes the `Listing.create()` method from the Base44 SDK. This call is securely transmitted to the Base44 backend, which persists the new listing record in the managed database.

## Core Technologies

*   **Frontend Framework:** React 18
*   **UI Components:** Shadcn/ui
*   **Styling:** Tailwind CSS 3.x
*   **Icons:** Lucide React
*   **Date Utilities:** `date-fns` (for client-side formatting), `moment` (for general use)
*   **Form Management:** `react-hook-form`
*   **Routing:** `react-router-dom`
*   **Animations:** `framer-motion`
*   **Charting:** `recharts`
*   **3D Viewer:** `three.js` (`<ARViewer>` component utilizes `ModelViewer`)
*   **Drag and Drop:** `@hello-pangea/dnd`
*   **Rich Text Editor:** `react-quill`
*   **Markdown Renderer:** `react-markdown`
*   **Map Integration:** `react-leaflet`
*   **Backend Platform:** Base44 (Managed Entities, Auth, File Storage, Core Integrations)
*   **Serverless Runtime:** Deno (for custom functions)
    *   Specifically, functions like `complianceCheck`, `demandForecasting`, `photogrammetry`, `voiceSearch` are deployed as `Deno.serve` HTTP handlers.
    *   External Deno dependencies are managed via `npm:` specifiers (e.g., `npm:openai`, `npm:jspdf`, `npm:stream-chat`).
*   **External APIs:**
    *   OpenAI API (for LLM inference in `InvokeLLM` and content moderation in `complianceCheck`).
    *   Supabase (Base44's underlying database is based on PostgreSQL, with RLS for data access).

## Data Model (Entities)

The application's data is structured around several key entities, defined by JSON Schema and managed by the Base44 platform. All entities automatically include `id`, `created_date`, `updated_date`, and `created_by` (user email).

*   `Listing`: Core item for sale/trade. Attributes include `title`, `description`, `price`, `category`, `condition`, `images`, `seller_email`, `status`, `views`, `compliance_score`, `model_3d_url`. RLS ensures only listing owners can update their own listings.
*   `User`: Extends the built-in user profile with `student_id`, `year`, `major`, `trust_score`, `total_sales`, `total_purchases`, `profile_image`, `bio`, `paypal_username`, `phone`. RLS allows users to update their own profiles.
*   `Trade`: Represents a trade proposal between users, linking `offered_listing_id` and `requested_listing_id`. Includes `status` (`pending`, `accepted`, `declined`, `cancelled`, `completed`), `offerer_email`, `receiver_email`, `value_difference`, `message`. RLS ensures only involved parties can read/update.
*   `Message`: Stores in-app communications within `conversation_id`-grouped threads. Includes `sender_email`, `recipient_email`, `content`, `is_read`, `message_type` (e.g., `text`, `meetup_proposal`). RLS restricts access to conversation participants.
*   `ContactRequest`: Facilitates secure contact initiation without immediate phone number disclosure. Includes `requester_email`, `owner_email`, `listing_id`, `phone_number`, `status` (`pending`, `number_viewed`, `contacted`). RLS ensures privacy.
*   `Review`: Enables user feedback post-transaction, linking `listing_id`, `reviewer_email`, `reviewed_email`, `rating`, `comment`.
*   `Favorite`: Allows users to bookmark listings.
*   `ComplianceLog`: Internal audit trail for content moderation flags.

## Serverless Functions (`/functions`)

Each function within this directory is an independent, versioned serverless endpoint optimized for specific tasks:

*   `complianceCheck.js`:
    *   **Purpose:** Content moderation. Analyzes `title`, `description`, and `images` for policy violations.
    *   **Integration:** Calls OpenAI's Moderation API for advanced text analysis and performs keyword/image name pattern matching.
    *   **Output:** Returns `complianceScore`, `blocked` status, and user-friendly messages/recommendations.
    *   **Security:** Requires `OPENAI_API_KEY` (managed via Base44 secrets) and user authentication.
*   `demandForecasting.js`:
    *   **Purpose:** Provides insights into market demand for specific categories.
    *   **Logic:** Simulates Prophet-like forecasting based on historical listing data, identifying seasonal peaks.
    *   **Integration:** Fetches historical `Listing` data via Base44 SDK.
*   `photogrammetry.js`:
    *   **Purpose:** Simulates the generation of 3D models from listing images.
    *   **Logic:** Returns a mock 3D model URL and confidence score. In a production environment, this would integrate with a specialized photogrammetry service.
    *   **Updates:** Persists `model_3d_url` and `model_confidence` back to the `Listing` entity.
*   `searchByVoice.js`:
    *   **Purpose:** Processes natural language queries from the voice assistant for listing search.
    *   **Logic:** Parses search terms from the voice query and performs a keyword-based search against active `Listing` entities, scoring relevance.
*   `messagesSend.js`:
    *   **Purpose:** Handles sending new messages within conversations.
    *   **Logic:** Creates a `Message` entity, generating a consistent `conversation_id` based on participants and `listing_id`.
*   `campusDensity.js`:
    *   **Purpose:** Provides real-time mock data on campus area density and safety.
    *   **Logic:** Generates dynamic density metrics for various UT Austin hotspots based on time-of-day and day-of-week heuristics.
    *   **Output:** Includes `hotspots` data and `safeZones` for recommended meetup locations.
*   `predictiveAnalytics.js`:
    *   **Purpose:** Predicts time-to-sale for a given listing and offers optimization suggestions.
    *   **Logic:** Uses a multi-factor model considering category, condition, price relativity to market average, image quality, and description length.
    *   **Integration:** Fetches `Listing` data and comparable market data via Base44 SDK.

## Frontend Structure

The React frontend maintains a clear, component-driven structure:

*   `/pages`: Top-level components representing distinct application views (e.g., `Dashboard.js`, `Browse.js`, `CreateListing.js`).
*   `/components`: Reusable UI modules, often nested within pages (e.g., `/listings/ListingCard.jsx`, `/voice/VoiceAssistant.jsx`, `/smartprice/SmartPriceAnalyzer.jsx`).
    *   Adheres to principles of small, focused components for maintainability.
*   `/ar`: Components related to Augmented Reality (e.g., `ARViewer`, `ModelViewer`).
*   `/dataviz`: Components for data visualization (e.g., `PriceHistoryChart`).
*   `/utils`: Helper functions, such as `createPageUrl` for consistent internal navigation.

## Security & Compliance

Security is a paramount concern, addressed at multiple layers:

*   **Authentication:** All user interactions requiring identification are secured via Base44's managed Google OAuth.
*   **Authorization:** User roles (`admin`, `user`) are enforced for sensitive operations (e.g., `AdminDashboard` access).
*   **Row-Level Security (RLS):** Database access is granularly controlled by RLS policies defined directly in entity schemas, ensuring users can only access data they are authorized for (e.g., users can only read messages where they are sender/recipient).
*   **Content Moderation Pipeline:** The `complianceCheck` function provides proactive moderation, blocking or flagging listings that violate community guidelines or legal restrictions. This includes AI-driven content analysis.
*   **Secrets Management:** Sensitive API keys (e.g., `OPENAI_API_KEY`) are stored securely as environment variables within the Base44 platform and are not exposed in client-side code.
*   **Secure Communications:** All API calls between frontend, Base44 services, and Deno Deploy functions are secured via HTTPS.

## Development & Deployment

*   **Development Environment:** The application is developed within the Base44 integrated development environment, providing real-time code changes and live previews.
*   **Local Development:** Supports local development with the Base44 CLI for custom serverless functions and testing.
*   **Deployment:** Base44 automatically builds and deploys frontend assets and Deno functions to a global CDN and Deno Deploy, respectively. This serverless, managed approach eliminates the need for manual DevOps.
*   **Continuous Deployment:** Changes pushed to the Base44 workspace are automatically built and deployed, providing a streamlined CI/CD pipeline.

## Further Enhancements

*   Real-time chat functionality for messages using a service like Stream Chat.
*   Push notifications for trade updates, new messages, or price drops.
*   Enhanced AI-powered price recommendations using real-time market data.
*   Integration with campus-specific identity management systems for student verification.
*   Advanced analytics and reporting for administrators.
*   Machine learning models for personalized item recommendations.
##
The landing page of Longhorn Exchange welcomes UT Austin students with a clean UI and quick access to browse or create listings. Users can also shop by predefined categories like Textbooks and Furniture:

<img width="500" alt="Screenshot 2025-07-09 at 11 41 56 PM" src="https://github.com/user-attachments/assets/72489ec5-e95e-4362-9f5d-ec04c9043b05" />

Marketplace view displays active marketplace listings with images, prices, categories, and filtering options. Users can initiate contact or propose trades directly from listing cards:

<img width="500" alt="Screenshot 2025-07-09 at 11 42 13 PM" src="https://github.com/user-attachments/assets/a9e75b64-e509-4568-956b-5b3a8d37a71b" />

The trading window shows real-time trade proposals between users, including offered items, requested items, cash differences, and messages. Enables users to track and respond to trade activity:

<img width="500" alt="Screenshot 2025-07-09 at 11 42 30 PM" src="https://github.com/user-attachments/assets/4da3eaa0-c43d-4158-b247-eacb9bafaa6f" />

The Campus Map shows recommended UT Austin campus spots for safe in-person trades, with photos, safety ratings, hours, and security features. Each location card highlights traffic levels, visibility, and unique attributes like landmark status or 24/7 access. Users can view details, check crowd levels, and get directions directly from the page:

<img width="500" alt="Screenshot 2025-07-09 at 11 42 43 PM" src="https://github.com/user-attachments/assets/8fa5af94-8cec-43b8-a64b-a5660b679468" />



# CampusLearn™ 📚

## Overview 🌟

CampusLearn™ is a peer-powered learning platform designed for Belgium Campus students to collaborate, share resources, and seek academic support. The platform enables students to create and subscribe to help topics, connect with tutors, and access learning materials in a user-friendly, customizable dashboard. This prototype demo facilitates peer-to-peer learning with features like topic discussions, tutor dashboards, and profile management. 🚀

## Features ✨

User Authentication 🔒: Secure login with Belgium Campus email using Supabase authentication, including social login options (Google, Microsoft) and password recovery.

Help Topics 📋: Browse, create, and subscribe to topics (e.g., SE202, DB101) with filtering by module or status, and view related questions.

Tutor Dashboard 🧑‍🏫: Tutors can manage assigned modules, respond to new questions, upload resources, and track performance metrics.

Profile Settings ⚙️: Users can update personal information, manage notification preferences, apply to become tutors, and configure account security (e.g., password changes, two-factor authentication).

Interactive Features 💬: Discussion threads, resource uploads, activity logs, and feedback forms to enhance engagement.

Responsive Design 📱: Built with Bootstrap for a seamless experience across desktop and mobile devices.

## Setup Instructions 🛠️

### Clone the Repository 📥:

git clone https://github.com/your-repo/campuslearn.git # Clone the CampusLearn repo
cd campuslearn

### Install Dependencies 📦:

Ensure a modern browser supports the required JavaScript and CSS.

No server-side setup is needed for the static prototype, but Supabase is used for authentication.

### Configure Supabase 🔑:

Create a Supabase project at supabase.com.

Update the supabaseUrl and supabaseAnonKey in login.html with your project's credentials:

const supabaseUrl = 'your-supabase-url';
const supabaseAnonKey = 'your-supabase-anon-key';

### Serve the Application 🌐:

Use a local server (e.g., VS Code Live Server, or npx http-server) to serve the static HTML files.

Open login.html in a browser to start.

### Test Authentication 🔐:

Use a @belgiumcampus.ac.za email for login testing.

Social login buttons (Google, Microsoft) are placeholders and require additional Supabase configuration for full functionality.

## File Structure 📁

    campuslearn/
    ├── assets/
    
    │   ├── css/
    
    │   │   └── styles.css      # Custom styles (if any) 🎨 
    
    │   ├── js/
    
    │   │   └── app.js         # General JavaScript utilities ⚙️
    
    │   └── images/
    
    │       └── Favicon.png    # Favicon for the platform 🖼️
    
    ├── login.html             # Login page with Supabase authentication 🔒
    
    ├── topics.html            # Browse and create help topics 📋
    
    ├── topic-detail.html      # Detailed view of a topic with discussion 💬
    
    ├── tutor-dashboard.html   # Tutor console for managing modules and questions 🧑‍🏫
    
    ├── profile.html           # User profile and account settings ⚙️
    
    └── README.md              # Project documentation 📄

## Technologies Used 🧑‍💻

HTML5: Structure for all pages.

CSS3 with Bootstrap 5.3.3: Responsive design and styling.

Font Awesome 6.5.2: Icons for UI elements.

JavaScript: Client-side interactivity and form handling.

Supabase: Authentication backend for login functionality.

CDNs:

Bootstrap: https://cdn.jsdelivr.net/npm/bootstrap@5.3.3

Font Awesome: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2

Supabase JS: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2

## Contribution Guidelines 🤝

Fork the repository and create a new branch for your feature or bug fix. 🌳

Ensure code follows the existing structure (e.g., Bootstrap classes, ID conventions like clNav). 📏

Test changes locally to confirm responsiveness and functionality. 🧪

Submit a pull request with a clear description of changes. 📬

For major changes, open an issue to discuss first. 💬

## Notes 📝

This is a prototype demo, not connected to real services. Some links (e.g., forgot-password.html, support.html) are placeholders.

Social login buttons require additional Supabase configuration for production use.

Ensure all external URLs (e.g., images, CDNs) are accessible and secure.

## License ⚖️

© 2025 CampusLearn™ – Peer-Powered Learning for Belgium Campus. This project is for demonstration purposes and not licensed for commercial use.

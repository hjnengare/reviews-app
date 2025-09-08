# Reviews App

A mobile-first, responsive reviews application built with Express.js backend and clean HTML/CSS/JavaScript frontend.

## Features

- **Mobile-first design** with Unsplash-inspired aesthetic
- **Responsive layout** across all device sizes
- **Express.js backend** for serving static files and routing
- **Onboarding flow** with interests and dealbreakers selection
- **Profile management** and review writing functionality
- **Clean, accessible UI** with proper ARIA support

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
4. Or start the production server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Available Routes

- `/` - Landing page
- `/onboarding` - Onboarding flow
- `/create-account` - Account creation
- `/interests` - Interests selection
- `/sub-interests` - Sub-interests selection  
- `/dealbreakers` - Dealbreakers selection
- `/complete` - Completion page
- `/profile` - User profile
- `/write-review` - Review writing

## Project Structure

```
reviews-app/
├── public/           # Static files (industry standard)
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript files
│   ├── images/       # Image assets
│   ├── icons/        # Icon assets
│   └── favicon.svg   # Site favicon
├── views/            # HTML templates
│   ├── index.html    # Landing page
│   ├── onboarding.html
│   ├── create-account.html
│   ├── interests.html
│   ├── sub-interests.html
│   ├── dealbreakers.html
│   ├── complete.html
│   ├── profile.html
│   └── write-review.html
├── routes/           # Route handlers (ready for expansion)
├── middleware/       # Custom middleware (ready for expansion)
├── config/           # Configuration files (ready for expansion)
├── server.js         # Express server
├── package.json      # Node.js dependencies
├── .gitignore        # Git ignore patterns
└── README.md         # Documentation
```

## Development

- Use `npm run dev` for development with nodemon auto-restart
- Use `npm start` for production
- All static assets are served from the `/public` directory (industry standard)
- HTML templates are served from the `/views` directory
- Mobile-first CSS with comprehensive responsive breakpoints
- Industry-standard Express.js folder structure for scalability
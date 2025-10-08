# Spoonity AI Booking - Timezone-Aware Meeting Planner

A smart, AI-powered meeting scheduling application designed specifically for Google Workspace organizations. Automatically finds optimal meeting times by analyzing calendar availability, suggesting ranked time slots, and directly booking Google Calendar events with Google Meet links.

## 🎯 Features

- **🤖 AI-Powered Suggestions**: Smart algorithm that ranks meeting times based on availability, working hours, and preferences
- **🌍 Timezone Awareness**: Automatically handles different timezones and DST transitions
- **📅 Direct Calendar Integration**: Books meetings directly in Google Calendar with Meet links
- **🔐 Participant Authorization**: Secure system for participants to authorize calendar access
- **⚡ Gumloop Integration**: Webhook automation for post-booking workflows
- **📧 Email Notifications**: SendGrid integration for participant invitations
- **👥 Directory Search**: On-demand Google Admin Directory user lookup

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** with App Router and React Server Components (RSC)
- **React 19.1.0** with modern hooks and state management
- **TypeScript 5** for type safety
- **Tailwind CSS 4** for styling with dark mode support
- **Geist Font** for typography

### Backend & API
- **Next.js API Routes** (App Router pattern)
- **Zod** for request validation and type safety
- **NextAuth.js 4.24.11** for authentication with Google OAuth

### Database & ORM
- **PostgreSQL** (via Docker Compose for development)
- **Prisma 6.16.3** as the ORM with migrations
- **@auth/prisma-adapter** for NextAuth integration

### External Integrations
- **Google APIs**:
  - Google Calendar API for availability checking and event creation
  - Google Admin Directory API for user search
  - Google OAuth for authentication
- **SendGrid** for email notifications
- **Gumloop** webhook integration for automation workflows

### Development Tools
- **ESLint** for code linting
- **Docker Compose** for local PostgreSQL
- **Turbopack** for fast development builds

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker and Docker Compose
- Google Cloud Console project with Calendar API enabled
- SendGrid account (optional, for email features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spoonity_Ai_booking
   ```

2. **Install dependencies**
   ```bash
   cd web
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the `web` directory:
   ```bash
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # Domain & Defaults
   GOOGLE_ALLOWED_DOMAIN=spoonity.com
   ORG_DEFAULT_TZ=America/Toronto

   # Email (optional)
   SENDGRID_API_KEY=your_sendgrid_api_key
   SEND_FROM_NAME="Spoonity Meeting Planner"
   SEND_FROM_EMAIL="mohammed+meetings@spoonity.com"

   # Database
   DATABASE_URL="postgresql://spoonity_user:spoonity_dev_password@localhost:5432/spoonity_meetings"

   # Automation (optional)
   GUMLOOP_WEBHOOK_URL=https://your-gumloop-webhook-url.com/webhook/spoonity-meetings
   ```

4. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   cd web
   npx prisma migrate dev
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth configuration
│   │   │   ├── plan/suggest/  # Meeting suggestions
│   │   │   ├── meetings/book/ # Calendar booking
│   │   │   ├── directory/     # User directory search
│   │   │   └── webhooks/      # Gumloop integration
│   │   ├── plan/              # Meeting planning UI
│   │   ├── participant/       # Authorization pages
│   │   └── admin/             # Admin setup
│   ├── lib/                   # Core business logic
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── google.ts         # Google API helpers
│   │   ├── suggest/engine.ts  # Meeting suggestion algorithm
│   │   └── scoring/           # Scoring configuration
│   └── types/                 # TypeScript definitions
├── prisma/                    # Database schema & migrations
└── public/                    # Static assets
```

## 🧠 How It Works

### Meeting Suggestion Algorithm

The app uses a sophisticated scoring system that considers multiple factors:

```json
{
  "weights": {
    "busyOverlapPenaltyPerMinute": -5,
    "unknownAvailabilityPenaltyPerParticipant": -20,
    "outsideWorkingHoursPenaltyPerMinute": -0.5,
    "distanceFromHoursMidpointPenaltyPerHour": -5,
    "earlierIsBetterPenaltyPerDay": -2
  }
}
```

**Scoring Factors:**
1. **Availability Conflicts**: Heavy penalty for busy times
2. **Working Hours**: Preference for business hours (8 AM - 5 PM)
3. **Time Preference**: Earlier meetings score higher
4. **Timezone Optimization**: Considers both organizer and participant timezones
5. **Provisional Status**: Marks suggestions as provisional when calendar access isn't available

### Authentication Flow

1. User visits the app and clicks "Sign in with Google"
2. Google OAuth checks domain restriction (`spoonity.com`)
3. User grants calendar and directory access permissions
4. JWT tokens are stored securely with refresh token support
5. User can now access all app features

### Meeting Planning Flow

1. **Enter Participant**: User enters participant email address
2. **Directory Search**: App searches Google Admin Directory (if available)
3. **Availability Check**: Fetches calendar busy times for both users
4. **Generate Suggestions**: Creates time slots within working hours
5. **Score & Rank**: Applies scoring algorithm to rank suggestions
6. **Display Results**: Shows top 5 suggestions with conflict indicators
7. **Book Meeting**: User selects time and books directly in Google Calendar
8. **Automation**: Sends webhook to Gumloop for additional workflows

## 🔐 Security & Authentication

### Domain Restriction
- Only `spoonity.com` domain users can access the app
- Google OAuth scopes include calendar and directory access
- JWT tokens stored securely with refresh token support

### Calendar Access
- Participants must authorize calendar access for accurate suggestions
- Provisional suggestions available for unauthorized users
- Secure token management with automatic refresh

## 📊 Database Schema

### Core Models
- **User**: NextAuth user accounts
- **Account/Session**: OAuth token management
- **AdminDirectoryAuth**: Super-admin directory access
- **MeetingPlan**: Meeting planning parameters and history
- **ParticipantAuth**: Participant authorization status

## 🎨 UI/UX Design

### Design System
- **Modern gradient-based design** with blue-to-purple themes
- **Dark mode support** throughout the application
- **Responsive design** for mobile and desktop
- **Smooth animations** and hover effects
- **Clear visual hierarchy** with proper spacing and typography

### Key UI Components
- **Landing page** with feature highlights and call-to-action
- **Meeting planning form** with real-time suggestions
- **Suggestion cards** showing time, score, and booking options
- **Status indicators** for provisional vs. confirmed suggestions
- **Success/error states** with clear messaging

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `GOOGLE_ALLOWED_DOMAIN` | Allowed Google domain | Yes |
| `ORG_DEFAULT_TZ` | Default timezone | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SENDGRID_API_KEY` | SendGrid API key | No |
| `GUMLOOP_WEBHOOK_URL` | Gumloop webhook URL | No |

### Google Cloud Setup

1. Create a Google Cloud Console project
2. Enable the following APIs:
   - Google Calendar API
   - Google Admin SDK API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

## 🚀 Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Database Setup

For production, use Vercel Postgres:
1. Create a Postgres database in Vercel
2. Update `DATABASE_URL` environment variable
3. Run migrations: `npx prisma migrate deploy`

## 📈 Performance & Scalability

### Optimizations
- **Turbopack** for fast development builds
- **React Server Components** for better performance
- **Efficient API calls** with proper error handling
- **Database indexing** on frequently queried fields
- **Caching strategies** for directory searches

### Rate Limiting
- Google API quota management
- Debounced directory searches
- Graceful error handling for API limits

## 🔌 Gumloop Integration

The app integrates with Gumloop for automation workflows. When a meeting is booked, it sends a webhook with meeting details:

```json
{
  "organizer_email": "mohammed@spoonity.com",
  "participant_name": "John Smith",
  "participant_email": "john.smith@company.com",
  "meeting_time": "2025-10-08T08:00:00.000Z",
  "meeting_duration_minutes": "30",
  "meeting_title": "Meeting: mohammed@spoonity.com + John Smith",
  "meeting_timezone": "Asia/Riyadh",
  "meet_link": "https://meet.google.com/abc-def-ghi",
  "event_link": "https://calendar.google.com/event?eid=...",
  "event_id": "google-calendar-event-id"
}
```

See [GUMLOOP_INTEGRATION.md](./GUMLOOP_INTEGRATION.md) for detailed setup instructions.

## 🧪 Testing

### Running Tests
```bash
# Run linting
npm run lint

# Test API endpoints
curl -X POST http://localhost:3000/api/plan/suggest \
  -H "Content-Type: application/json" \
  -d '{"organizerEmail":"test@spoonity.com","participantEmail":"participant@spoonity.com"}'
```

### Test Files
- `test-gumloop-webhook.js` - Test Gumloop webhook integration
- `test-participant-email.js` - Test participant email functionality

## 📚 API Documentation

### Endpoints

#### `POST /api/plan/suggest`
Generate meeting time suggestions.

**Request:**
```json
{
  "organizerEmail": "organizer@spoonity.com",
  "participantEmail": "participant@spoonity.com",
  "durationMinutes": 30,
  "stepMinutes": 30,
  "windowDays": 7,
  "minNoticeHours": 2,
  "fallbackStartHour": 8,
  "fallbackEndHour": 17,
  "excludeWeekends": true
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "start": "2025-01-15T10:00:00.000Z",
      "end": "2025-01-15T10:30:00.000Z",
      "score": 85,
      "provisional": false
    }
  ]
}
```

#### `POST /api/meetings/book`
Book a meeting in Google Calendar.

**Request:**
```json
{
  "organizerEmail": "organizer@spoonity.com",
  "participantEmail": "participant@spoonity.com",
  "start": "2025-01-15T10:00:00.000Z",
  "durationMinutes": 30,
  "title": "Optional Meeting Title"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "google-calendar-event-id",
  "meetLink": "https://meet.google.com/abc-def-ghi",
  "eventLink": "https://calendar.google.com/event?eid=...",
  "gumloopWebhookSent": true
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is proprietary software owned by Spoonity.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the [SPEC.md](./SPEC.md) for detailed technical specifications

---

**Built with ❤️ by the Spoonity team**
# 🚀 Level Up - Learn to Earn Platform

> A community-driven, open-source learning platform where developers earn rewards for learning and contributing. Built on Hedera with blockchain-powered certificates and platform tokens.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hedera](https://img.shields.io/badge/Built%20on-Hedera-purple)](https://hedera.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING_COURSES.md)

---

## 📖 About

**Level Up** is a revolutionary learn-to-earn platform that rewards developers for learning and contributing to the community. Complete courses, earn platform tokens, mint NFT certificates, and engage in peer discussions—all powered by blockchain technology.

### ✨ Key Features

- 🎓 **Structured Learning Paths** - Comprehensive courses from beginner to advanced
- 🪙 **Earn Platform Tokens** - Get rewarded for completing lessons and assignments
- 🏆 **NFT Certificates** - Mint blockchain-verified certificates for completed courses
- 💬 **Community Discussions** - Q&A and discussions stored on Hedera Consensus Service
- 🎯 **Points & Levels System** - Track progress with points and unlock new levels
- 🤝 **Peer Review** - Submit assignments and get community feedback
- 🌐 **Open Source** - Anyone can contribute courses via pull requests

---

## 🛠️ Tech Stack

**Frontend:**

- React + Vite
- React Router
- CSS Modules
- Lucide Icons

**Backend:**

- Supabase (PostgreSQL + Edge Functions)
- Row Level Security (RLS)
- Real-time subscriptions

**Blockchain:**

- Hedera Hashgraph
- Hedera Token Service (HTS)
- Hedera Consensus Service (HCS)

**DevOps:**

- GitHub Actions (Auto-sync courses)
- Git-based content management

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/levelupdevs1/levelup-curriculum.git
   cd levelup-curriculum
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**

   Run the SQL migrations in your Supabase dashboard (see `SUPABASE_UPDATES.sql`)

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:5173`

---

## 📚 Project Structure

```
level-up/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/            # React contexts (CourseContext, UserContext)
│   ├── courses/             # Course content (markdown files)
│   │   ├── web-development-basics/
│   │   ├── react-fundamentals/
│   │   └── javascript-advanced/
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── services/            # API services (auth, courses, progress)
│   └── utils/               # Helper functions
├── .github/workflows/       # GitHub Actions
├── public/                  # Static assets
└── supabase/               # Supabase Edge Functions
```

---

## 🎓 How It Works

### For Learners

1. **Sign Up** - Create your account with email and password
2. **Browse Courses** - Explore courses synced from GitHub
3. **Enroll & Learn** - Start learning and completing lessons
4. **Earn Points** - Get 10 points per lesson, 15 per assignment
5. **Level Up** - Reach 500 points per level
6. **Claim Tokens** - Receive platform tokens when you level up
7. **Get Certificates** - Mint NFT certificates for completed courses

### For Contributors

1. **Fork the Repository**
2. **Add/Update Courses** - Create markdown files and `course.json`
3. **Open a Pull Request**
4. **Automatic Sync** - Courses sync to Supabase when merged
5. **Community Impact** - Help others learn and grow

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🪙 Token Economics

### Earning Tokens

- **Level Up Rewards**: 10, 50, 70, 100, 150, 200 tokens per level
- **Tips**: Earn tokens from community members for helpful contributions
- **Full Ownership**: Tokens sent to your Hedera wallet—you own them

### Using Tokens

- **Trade**: Sell or swap on decentralized exchanges
- **Hold**: Keep for potential appreciation
- **Mint Certificates**: Optionally burn tokens for NFT certificates
- **AI Review Priority**: Pay tokens for faster assignment feedback
- **Flexible**: You decide what to do with your earned tokens

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GitHub Repository                       │
│            (Courses as Markdown + course.json)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ PR Merged → GitHub Actions
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Function (sync-courses)           │
│           Parses course.json, syncs to database              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   Supabase PostgreSQL                        │
│    (users, courses, progress, enrollments, submissions)      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│      Displays courses, tracks progress, manages state        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   Hedera Hashgraph                           │
│         (Platform Tokens, NFT Certificates, HCS)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

```sql
users (
  id, email, full_name, username, wallet_address,
  total_points, current_level, created_at
)

courses (
  id, title, description, level, tags, thumbnail,
  modules (JSONB), git_path, last_synced_at
)

enrollments (
  id, user_id, course_id, enrolled_at, status
)

progress (
  id, user_id, course_id, module_id, lesson_id,
  completed_at, points_earned
)

submissions (
  id, user_id, course_id, assignment_id,
  submission_content, status, points_earned
)

completions (
  id, user_id, course_id, completed_at,
  certificate_eligible
)

token_claims (
  id, user_id, level, tokens_claimed,
  claimed_at, tx_hash, status
)
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Contributing Courses

See [CONTRIBUTING_COURSES.md](CONTRIBUTING_COURSES.md) for detailed instructions on:

- Course structure and format
- Creating `course.json` files
- Writing markdown lessons
- Submitting pull requests

### Contributing Code

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Documentation

- [Contributing Courses](CONTRIBUTING.md) - How to add or update courses
- [MVP Status](MVP_STATUS.md) - Current development status

---

## 🎯 Roadmap

### Phase 1: MVP ✅

- [x] Course management system
- [x] User authentication
- [x] Progress tracking
- [x] Points & levels
- [x] GitHub Actions auto-sync
- [x] Course thumbnails

### Phase 2: Blockchain Integration 🚧

- [ ] Hedera wallet connection
- [ ] Platform token (HTS)
- [ ] NFT certificate minting
- [ ] Token claiming system
- [ ] Discussions on HCS

### Phase 3: Community Features 📅

- [ ] AI-powered code review
- [ ] Peer review system
- [ ] Bounties & challenges
- [ ] Hackathon hosting
- [ ] Data monetization

---

## 🏆 Revenue Model

- **Sponsor Bounties**: 10-15% platform cut
- **Hackathon Hosting**: 20% of prize pools
- **Data Monetization**: Anonymized Q&A data sales
- **Enterprise Training**: Custom bootcamps for companies
- **Recruitment Partnerships**: Referral fees

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Acknowledgments

- Built with ❤️ by the Level Up community
- Powered by [Hedera Hashgraph](https://hedera.com)
- Backend by [Supabase](https://supabase.com)
- UI inspired by modern learning platforms

---

## 📞 Support

- **Documentation**: Check our docs folder
- **Issues**: [GitHub Issues](https://github.com/levelupdevs1/levelup-curriculum/issues)
- **Discussions**: [GitHub Discussions](https://github.com/levelupdevs1/levelup-curriculum/discussions)
- **Email**: support@levelup.dev (coming soon)

---

## 🔗 Links

- **Website**: [Coming Soon]
- **Twitter**: [Coming Soon]
- **Discord**: [Coming Soon]

---

<p align="center">
  <strong>Built for developers, by developers. Learn, earn, and level up! 🚀</strong>
</p>

<p align="center">
  Made with ❤️ for the open-source community
</p>

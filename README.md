# Agami Frontend (v2)

কোচিং সেন্টার পরিচালনার জন্য teacher/student dashboard — React + Vite।

## মূল ফিচার

- **Authentication** — Register, email activation, login, password reset
- **EN/BN ভাষা টগল** — পুরো app জুড়ে (dashboard, nav, buttons) এক ক্লিকে ইংরেজি ↔ বাংলা পরিবর্তন
- **Teacher Dashboard** — batch summary, আজকের সেশন, activity overview
- **Batch ব্যবস্থাপনা** — batch তৈরি, invite code/email দিয়ে student যোগ, student তালিকা
- **Classroom (Room)** — notice/post ফিড, rich-text কনটেন্ট
- **Attendance** — daily sheet + monthly রিপোর্ট (teacher ও student উভয় ভিউ)
- **Exam ও Result** — পরীক্ষা তৈরি, নম্বর এন্ট্রি, leaderboard
- **Class Routine** — সাপ্তাহিক রুটিন তৈরি ও দেখা
- **Fee ব্যবস্থাপনা** — fee structure, payment status
- **Subscription/Billing** — ৩-স্তরের plan (Basic ৳299 / Standard ৳499 / Pro ৳999) + ৩০ দিনের Free Trial, batch-limit অনুযায়ী card, trial/subscription শেষ হলে lock screen + upgrade prompt
- **Payment** — SSLCommerz checkout flow, payment result page
- **Bulk SMS** — batch-এর সব student-কে একসাথে SMS
- **Refer & Earn** — referral link শেয়ার ও ট্র্যাকিং
- **Notifications** — in-app notification panel
- **Platform Admin Dashboard** (`/admin`, `is_staff` গেটেড) — সব teacher-এর subscription activity, revenue, expiring-soon মনিটরিং, নিজস্ব sidebar নেভিগেশন
- **Student Dashboard** — join batch (invite code/link), batch list, attendance/result/fee দেখা

## Tech Stack

React 19, Vite, React Router, TanStack Query (React Query), Tailwind CSS, Axios

## Local চালানো

```bash
npm install
cp .env.example .env   # VITE_API_URL বসাও
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Vercel-এ deploy করা — SPA client-side routing কাজ করার জন্য `vercel.json`-এ rewrite rule আছে (সব route `index.html`-এ পাঠায়)।

🌐 Social + Q&A Platform (Subscriptions + Rewards)

A full-stack web application combining a social public space, StackOverflow-style Q&A system, subscription plans, forgot password with password generator, and a reward/points system.

🚀 Tech Stack

Frontend: Html /css /js  (Deployed on Vercel)

Backend: Node.js + Express (Deployed on Render)

Database: Neon PostgreSQL (Neon)

Media Storage: Cloudinary (Images + Videos)


✨ Core Features
1) Public Space (Social Feed)

Users can upload:

Pictures & Videos

Comments

Like & Share

Posting Rules

0 friends → cannot post

Default → 1 post/day

2 friends → 2 posts/day

10+ friends → unlimited posts/day

2) Forgot Password + Password Generator

Reset password using email =

Forgot password request allowed only once per day

If requested more than once → warning shown

Password Generator Rules

Generated password contains:

Only uppercase + lowercase letters

3) Subscription Plans (Posting Questions)

Users can post questions based on subscription plan limits:

Plan	Price	Questions/Day
Free	₹0	1
Bronze	₹100/month	5
Silver	₹300/month	10
Gold	₹1000/month	Unlimited
Payment Rules

Payments allowed only between 10 AM to 11 AM IST

Payments outside this time window are blocked

After Successful Payment

4) Reward System (Points + Transfers)

Answering a question → +5 points

If the answer reaches 5 upvotes → +5 bonus points

Points Transfer

Users can transfer points by searching another user profile

Transfer allowed only if sender has more than 10 points

If points ≤ 10 → transfer blocked

Points Deduction

If an answer is removed → points reduce to 5

If upvotes decrease → points deduct to 1


My Rhyme Star
1. Executive Summary
My Rhyme Star lets parents upload one photo of their child, auto-generate a cute 3-D cartoon avatar (in a family-friendly style) and place that avatar into classic 30 s / 60 s nursery-rhyme videos. A gem-based economy (first 200 gems free, IAP thereafter) controls usage, while viral referrals, in-app purchases, and multi-language rhymes grow and monetize the product
2. Objectives & Success Metrics
Objective
KPI (90-day target)
Drive revenue via gem purchases
≥ 20 % of WAU buy gems
Keep generation success high
≥ 75 % jobs complete
Spur organic installs
K-factor ≥ 0.35

3. Primary User Personas
Persona
Goals
Pain Points
“Proud Parent Priya” (28-40)
Unique keepsakes to share on social
Child-safe content, quick results
“Gift-Giver Raj” (20-35)
Surprise nephew/niece with fun video
Limited time, wants wow factor
Kids (indirect) (2-6)
Entertained by seeing themselves
Short attention span

4. Core Integrations
Domain
Service
Purpose
Avatar Rendering
GPT-4o
Generate kid-style cartoon face
Video Synthesis
Kling API
Compose rhyme scenes with avatar
Payments
Apple IAP, Google Play Billing
Gem pack purchases / restore
Backend
Supabase
Auth, gem ledger, rhyme catalog, referrals
Analytics
Firebase
Event tracking, funnels
Storage & CDN
AWS S3 + CloudFront
Store videos 30 days, HLS streaming
Content Safety
OpenAI moderation & on-device face detection
Filter images, verify child photo

5. Screen-by-Screen Use-Cases & Requirements

5.1 Splash / Loading
Usecases
Brand impression; preload config


Requirements
Autodismiss ≤ 3 s or after preload
Maintenance flag ➜ I3

Design


5.2 Age Gate & ToS
Usecases
COPPA consent

Requirements
Checkbox must be ticked to enable Continue
Decline exits app

Design


5.3 Intro Carousel
Usecases
Teach 3-step flow

Requirements
Three slides; Skip CTA; first-launch only

Design

5.4 Upload Photo
Usecases
Add child photo & name

Requirements
Face-detector validation
JPG/PNG ≤ 5 MB

Design



5.5 Upload Photo
Usecases
Add child photo & name

Requirements
Face-detector validation
JPG/PNG ≤ 5 MB

Design


5.6 Home 
Usecases
Show wallet, last rhyme, entry to catalog

Requirements
Avatar at the top
Gem balance and ability to buy gems
A scrollable 2-col grid catalog of rhymes including - (1) Wheel on the bus, (2) Johnny johnny yes papa, (3) baba black sheep, each with duration and gems to create them
Pull-to-refresh
Rhymes already created can be identified 

Design

5.7 Rhyme Catalog 
Usecases
Show wallet, last rhyme, entry to catalog

Requirements
Avatar at the top
Gem balance at the top
A scrollable 2-col grid catalog of rhymes including - (1) Wheel on the bus, (2) Johnny johnny yes papa, (3) baba black sheep, each with duration and gems to create them 
Search for rhymes
Rhymes already created can be identified 

Design


5.8 Rhyme Confirmation 
Usecases
Final spend confirmation

Requirements
User sees the number of gems needed to create the rhyme, the duration of the rhyme along with thumbnail of the rhyme
Moves to rhyme generation screen

Design


5.9 Video playback 
Usecases
Play, download, share or recreate the rhyme

Requirements
HLS player; 9:16
Download watermarked MP4
Regenerate button (cost)
Video player requirements
User can play, pause, change timestamp of what is being played dragging the progress on video player

Design


5.10 Regenerate Modal 
Usecases
Recreate rhyme. It costs gems

Requirements
Same gem cost
If failed, gems are refunded back to user’s wallet

Design


5.11 Gem Store 
Usecases
Buy gem packs / restore

Requirements
Four tiers (100/500/1500/4000)

Design


5.12 Low Gem Alert 
Usecases
Upsell prompt

Requirements
Shows when balance < cheapest rhyme



Design

5.13 Referral Invite 
Usecases
Share referral code with friends to get them onboarded

Requirements
 Copy/share link (WhatsApp, Insta, SMS)
+50 gems on first video each side

Design

5.14 Network Error 
Usecases
Offline retry

Requirements
 Retry every 5 s

Design


5.15 Delete Data 
Usecases
GDPR/COPPA erase

Requirements
 Double confirm
Auto logout & purge

Design

5.16 Render Failed 
Usecases
Retry render

Requirements
 Gems auto-refunded

Design





7. Non-Functional Requirements
Area
Specification
Performance
Cold start TTI ≤ 3 s; avatar render p50 ≤ 20 s
Availability
≥ 99.5 % monthly
Privacy
Photos/videos auto-delete after 30 days or on request
Security
TLS 1.2+; AES-256 at rest; idempotent gem ledger
Accessibility
WCAG AA text contrast, VoiceOver labels
Localization
UI + TTS for EN, HI, TA, TE, BN, KN


8. Analytics & Instrumentation
Event
Properties
avatar_created
duration_ms
video_generated
rhyme_id, runtime, quality
gem_purchase
pack_size, revenue_usd
share_clicked
channel
referral_complete
referrer_id

9. Rhyme generation process
Rhymes are configured in n8n. Generating a rhyme just triggers the n8n workflow, takes the generated rhyme video and stores it in supabase and then informs the app that rhyme is generated

10. Login
Integrated with Google play login. Opening the app with same login on any phone with same login will show the user's data
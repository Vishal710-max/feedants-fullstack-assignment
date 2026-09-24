/* Seeds the sample competition from the design. Run: npm run seed  (drops existing data) */
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('./config/env');
const connectDB = require('./config/db');
const Competition = require('./models/Competition');
const User = require('./models/User');
const Registration = require('./models/Registration');
const Submission = require('./models/Submission');
const PaymentOrder = require('./models/PaymentOrder');
const Review = require('./models/Review');

const MIN = 60e3, H = 60 * MIN, D = 24 * H;
const VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4'; // placeholder video

(async () => {
  await connectDB(config.mongoUri);
  await Promise.all([Competition, User, Registration, Submission, PaymentOrder, Review].map((m) => m.deleteMany({})));
  const now = Date.now();

  const competition = await Competition.create({
    slug: 'feedants-classical-dance',
    title: 'Feedants Classical Dance',
    category: 'Dance',
    tags: ['Dance', 'Multi-Win'],
    certificateText: 'Winners get certificate',
    prizePool: 1500,
    entryFee: 99,
    maxParticipants: 20,
    // Dates are relative to "now" so the countdown from the design (~1d 6h 28m) is live whenever you seed.
    registrationStart: new Date(now - 6 * D),
    registrationEnd: new Date(now + D + 6 * H + 28 * MIN + 32e3),
    submissionStart: new Date(now - 2 * D),
    submissionEnd: new Date(now + 20 * D),
    resultDate: new Date(now + 22 * D),
    judge: {
      name: 'Manju Dubey',
      designation: 'Professional Kathak Dancer',
      experience: '12+ Years of Experience',
      imageUrl: 'https://i.pravatar.cc/300?img=47',
      introVideoUrl: VIDEO,
    },
    about: [
      'This is an online classical dance competition open for all age groups.',
      'Participate from anywhere and showcase your talent.',
      'Express your passion through traditional dance.',
      'Submit a single video performance of 2 to 5 minutes in any Indian classical form: Kathak, Bharatanatyam, Odissi, Kuchipudi, Manipuri, Mohiniyattam or Sattriya.',
    ],
    judgingParameters: [
      { title: 'Technique', description: 'Footwork, posture, mudras and command over the chosen form.', weightage: 30 },
      { title: 'Expression', description: 'Abhinaya, emotion and storytelling.', weightage: 25 },
      { title: 'Rhythm & Music', description: 'Sense of taal and synchronisation with the music.', weightage: 25 },
      { title: 'Presentation', description: 'Costume, framing, video and audio quality.', weightage: 20 },
    ],
    rules: [
      'One submission per participant.',
      'Video must be 2 to 5 minutes long, in MP4 or MOV format, up to 100 MB.',
      'Performance must be original and recorded by the participant.',
      'Submissions must be uploaded before the submission deadline.',
    ],
    eligibility: ['Open to participants of all ages.', 'Participants must have a Feedants account.', 'Entry fee must be paid to be considered for judging.'],
    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],
    previousWinners: [
      { name: 'Riya Shah', position: 1, label: '1st Winner', thumbnailUrl: 'https://i.pravatar.cc/200?img=32', videoUrl: VIDEO },
      { name: 'Aarav Mehta', position: 1, label: '1st Winner', thumbnailUrl: 'https://i.pravatar.cc/200?img=12', videoUrl: VIDEO },
      { name: 'Neha Verma', position: 2, label: '2nd Winner', thumbnailUrl: 'https://i.pravatar.cc/200?img=45', videoUrl: VIDEO },
      { name: 'Ishita Chopra', position: 3, label: '3rd Winner', thumbnailUrl: 'https://i.pravatar.cc/200?img=44', videoUrl: VIDEO },
    ],
    disclaimer: 'Only contributions from paid participants will be considered for judging.',
    refundPolicy:
      'Entry fees are non-refundable once registration is confirmed. If a payment is captured but your registration could not be completed (for example, the competition filled up), the amount is refunded to the original payment method within 5-7 working days.',
    prizeInfoVideoUrl: VIDEO,
    referralReward: 10,
    allowedFileTypes: ['mp4', 'mov'],
    maxFileSizeMB: 100,
  });

  const passwordHash = await bcrypt.hash('Demo@1234', 10);
  const [demo, other] = await User.create([
    { name: 'Demo User', email: 'demo@feedants.com', passwordHash, referralCode: 'referral123' },
    { name: 'Priya Nair', email: 'priya@feedants.com', passwordHash, referralCode: 'priya4f2a1c' },
  ]);

  // One existing participant -> "1 / 20 booked, 19 spots left" like the design.
  await Registration.create({ userId: other._id, competitionId: competition._id, orderId: 'order_seed_1', paymentId: 'pay_seed_1', amountPaid: 99 });
  await Competition.updateOne({ _id: competition._id }, { registeredCount: 1 });

  await Review.insertMany([
    { competitionId: competition._id, userName: 'Sneha K.', rating: 5, comment: 'Well organised and the judging was fair. Loved the feedback.' },
    { competitionId: competition._id, userName: 'Rohit P.', rating: 4, comment: 'Smooth upload process. Would like a longer submission window.' },
    { competitionId: competition._id, userName: 'Ananya S.', rating: 5, comment: 'Got my certificate within a week of results. Great platform!' },
    { competitionId: competition._id, userName: 'Karan M.', rating: 4, comment: 'Payment and registration were quick.' },
  ]);

  console.log('Seeded competition:', competition.slug);
  console.log('Demo login -> demo@feedants.com / Demo@1234');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });

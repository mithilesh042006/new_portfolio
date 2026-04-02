// Seed script — run once to populate Firestore with initial portfolio data.
// Usage: npx tsx scripts/seed.ts
// Make sure VITE_* env vars are set in .env

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

async function seed() {
  console.log('🌱 Seeding Firestore...');

  // About
  await setDoc(doc(db, 'about', 'main'), {
    name: 'Mithilesh',
    bio: 'I craft high-performance digital experiences at the intersection of design and code — blending immersive animations, elegant interfaces, and cutting-edge web technology.',
    email: 'hello@example.com',
    socials: { github: 'https://github.com/', linkedin: 'https://linkedin.com/', twitter: 'https://twitter.com/', instagram: '' },
  });
  console.log('✅ About');

  // Example project — update with real data via admin dashboard
  await addDoc(collection(db, 'projects'), {
    title: 'My Portfolio', description: 'Interactive portfolio with GSAP animations and Firebase backend.', tech: ['React', 'TypeScript', 'Vite', 'Firebase', 'GSAP'],
    imageUrl: '', liveUrl: 'https://your-site.web.app', githubUrl: 'https://github.com/', featured: true, year: 2025, category: 'Web', order: 0,
  });
  console.log('✅ Projects');

  // Experience
  await addDoc(collection(db, 'experiences'), {
    role: 'Frontend Developer', company: 'Freelance', period: '2023 – Present', description: 'Building modern web applications for clients.', order: 0,
  });
  console.log('✅ Experiences');

  // Qualification
  await addDoc(collection(db, 'qualifications'), {
    title: 'B.Tech Computer Science', institution: 'Your University', year: '2022 – 2026', description: 'Core CS fundamentals, data structures, and software engineering.', iconName: 'GraduationCap', order: 0,
  });
  console.log('✅ Qualifications');

  // Testimonial
  await addDoc(collection(db, 'testimonials'), {
    quote: 'Mithilesh delivered exceptional work — clean code, great communication, and outstanding results.', author: 'Client Name', role: 'CEO, Company',
  });
  console.log('✅ Testimonials');

  console.log('\n🎉 Seed complete! Visit the admin dashboard to manage content.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });

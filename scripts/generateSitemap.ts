/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml based on Firestore content
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Firebase configuration (use your actual config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SITE_URL = 'https://aidome.com';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');

  const urls: SitemapUrl[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { path: '/', changefreq: 'daily' as const, priority: 1.0 },
    { path: '/gallery', changefreq: 'weekly' as const, priority: 0.9 },
    { path: '/cinematic', changefreq: 'weekly' as const, priority: 0.9 },
    { path: '/learn', changefreq: 'weekly' as const, priority: 0.9 },
    { path: '/signin', changefreq: 'monthly' as const, priority: 0.5 },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  try {
    // Fetch designs
    const designsSnapshot = await getDocs(collection(db, 'designs'));
    designsSnapshot.forEach(doc => {
      urls.push({
        loc: `${SITE_URL}/design/${doc.id}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.8,
      });
    });
    console.log(`✅ Added ${designsSnapshot.size} design pages`);

    // Fetch courses
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    coursesSnapshot.forEach(doc => {
      urls.push({
        loc: `${SITE_URL}/course/${doc.id}`,
        lastmod: today,
        changefreq: 'weekly',
        priority: 0.8,
      });
    });
    console.log(`✅ Added ${coursesSnapshot.size} course pages`);

    // Fetch cinematics
    const cinematicsSnapshot = await getDocs(collection(db, 'cinematics'));
    cinematicsSnapshot.forEach(doc => {
      urls.push({
        loc: `${SITE_URL}/cinematic/${doc.id}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.7,
      });
    });
    console.log(`✅ Added ${cinematicsSnapshot.size} cinematic pages`);

  } catch (error) {
    console.error('❌ Error fetching data:', error);
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Write to file
  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, xml);

  console.log(`✅ Sitemap generated with ${urls.length} URLs`);
  console.log(`📁 Saved to: ${outputPath}`);
}

generateSitemap()
  .then(() => {
    console.log('✅ Sitemap generation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  });

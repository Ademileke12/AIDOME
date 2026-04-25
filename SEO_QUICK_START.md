# SEO Quick Start Guide

## 🚀 Immediate Actions

### 1. Generate Sitemap
```bash
npm run sitemap
```

### 2. Submit to Search Engines

**Google Search Console:**
1. Go to https://search.google.com/search-console
2. Add your property (https://aidome.com)
3. Verify ownership
4. Submit sitemap: https://aidome.com/sitemap.xml

**Bing Webmaster Tools:**
1. Go to https://www.bing.com/webmasters
2. Add your site
3. Verify ownership
4. Submit sitemap

### 3. Set Up Analytics

Add Google Analytics 4 to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 📝 Using SEO Component

### Basic Usage

```tsx
import SEO from '../components/SEO';

function MyPage() {
  return (
    <>
      <SEO
        title="Page Title"
        description="Page description"
        keywords={['keyword1', 'keyword2']}
      />
      {/* Your content */}
    </>
  );
}
```

### With Structured Data

```tsx
import SEO, { generateStructuredData } from '../components/SEO';

function CoursePage({ course }) {
  return (
    <>
      <SEO
        title={course.title}
        description={course.description}
        structuredData={generateStructuredData.course({
          title: course.title,
          description: course.description,
          provider: 'AI Dome',
          url: window.location.href,
          price: course.price,
          currency: 'USD'
        })}
      />
      {/* Your content */}
    </>
  );
}
```

## ✅ SEO Checklist

### Every Page Should Have:
- [ ] Unique title (50-60 characters)
- [ ] Meta description (150-160 characters)
- [ ] Relevant keywords
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] Alt text for images
- [ ] Internal links
- [ ] Mobile-responsive design
- [ ] Fast loading time (<3 seconds)

### Homepage Specific:
- [ ] Clear value proposition
- [ ] Links to main sections
- [ ] Structured data (Website + Organization)
- [ ] High-quality hero image
- [ ] Call-to-action buttons

### Content Pages:
- [ ] Descriptive URLs
- [ ] Breadcrumb navigation
- [ ] Related content links
- [ ] Social sharing buttons
- [ ] Comments/engagement features

## 🎯 Content Optimization

### Title Best Practices
```tsx
// ❌ Bad
<SEO title="Course" />

// ✅ Good
<SEO title="Web Design Fundamentals - Complete Course | AI Dome" />
```

### Description Best Practices
```tsx
// ❌ Bad
<SEO description="Learn design" />

// ✅ Good
<SEO 
  description="Master web design fundamentals with our comprehensive course. Learn UI/UX principles, modern design patterns, and build real-world projects. Start today!"
/>
```

### Keywords Best Practices
```tsx
// ❌ Bad
<SEO keywords={['design']} />

// ✅ Good
<SEO 
  keywords={[
    'web design course',
    'UI UX design',
    'design fundamentals',
    'online design learning',
    'web development'
  ]}
/>
```

## 🖼️ Image Optimization

### Always Include Alt Text
```tsx
<img 
  src="design.jpg" 
  alt="Modern minimalist web design with dark theme"
  loading="lazy"
  width="1200"
  height="800"
/>
```

### Optimize Image Sizes
- Hero images: 1920x1080 (max 200KB)
- Thumbnails: 600x400 (max 50KB)
- Icons: 100x100 (max 10KB)
- Use WebP format when possible

## 🔗 Internal Linking Strategy

### Homepage Links To:
- Gallery
- Courses
- Cinematic Gallery
- Sign In

### Gallery Links To:
- Individual designs
- Related categories
- Homepage

### Course Pages Link To:
- Course list
- Related courses
- Homepage
- Gallery (if relevant)

## 📊 Monitoring

### Weekly Tasks:
- Check Google Search Console for errors
- Review new indexed pages
- Monitor keyword rankings
- Check page speed

### Monthly Tasks:
- Analyze traffic trends
- Review top-performing pages
- Update sitemap
- Check broken links
- Review competitor SEO

### Quarterly Tasks:
- Full SEO audit
- Update content strategy
- Review and update keywords
- Analyze backlink profile

## 🚨 Common Issues & Fixes

### Issue: Pages Not Indexed
**Solution:**
1. Check robots.txt
2. Submit sitemap to Search Console
3. Verify canonical URLs
4. Check for noindex tags

### Issue: Low Click-Through Rate
**Solution:**
1. Improve title tags
2. Write compelling meta descriptions
3. Add structured data for rich snippets
4. Optimize for featured snippets

### Issue: Slow Page Speed
**Solution:**
1. Optimize images
2. Enable lazy loading
3. Minimize JavaScript
4. Use CDN
5. Enable caching

### Issue: Duplicate Content
**Solution:**
1. Use canonical URLs
2. Implement 301 redirects
3. Use noindex for duplicate pages
4. Create unique content

## 🎓 Resources

- [Google Search Central](https://developers.google.com/search)
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo)
- [Ahrefs SEO Toolkit](https://ahrefs.com/)
- [Schema.org Documentation](https://schema.org/)

## 📞 Support

For SEO questions or issues:
1. Check the full SEO_IMPLEMENTATION_GUIDE.md
2. Review Google Search Console
3. Test with Google's Rich Results Test
4. Validate structured data

---

**Remember:** SEO is a long-term strategy. Results typically take 3-6 months to show significant improvement.

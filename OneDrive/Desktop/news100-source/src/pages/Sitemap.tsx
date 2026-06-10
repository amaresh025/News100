const Sitemap = () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>/</loc><changefreq>hourly</changefreq><priority>1.0</priority></url>
  <url><loc>/latest</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>
  <url><loc>/category/politics</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>
  <url><loc>/category/india</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>
  <url><loc>/category/business</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>
  <url><loc>/category/sports</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>
  <url><loc>/category/entertainment</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>
  <url><loc>/category/technology</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>
  <url><loc>/category/health</loc><changefreq>daily</changefreq><priority>0.7</priority></url>
  <url><loc>/contact</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
  <url><loc>/about</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
  <url><loc>/privacy</loc><changefreq>yearly</changefreq><priority>0.2</priority></url>
  <url><loc>/terms</loc><changefreq>yearly</changefreq><priority>0.2</priority></url>
</urlset>`;
  return (
    <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', padding: 20, margin: 0 }}>
      {xml}
    </pre>
  );
};

export default Sitemap;

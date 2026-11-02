import https from 'https';

const url = 'https://devpath-mvj2.onrender.com/api/categories';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Categories count:', json.data?.length);
      json.data?.forEach(cat => {
        console.log(`- Category: ${cat.name} (${cat.roadmaps?.length || 0} roadmaps)`);
        cat.roadmaps?.forEach(r => {
          console.log(`    * [${r.status}] ${r.title} (${r.duration}d)`);
        });
      });
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
}).on('error', (err) => console.error('Request error:', err.message));

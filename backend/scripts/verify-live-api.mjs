import https from 'https';

const url = 'https://devpath-mvj2.onrender.com/api/roadmaps/0b9059fe-7c05-4c6c-8e7e-b8f51d1de942';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('HTTP Status:', res.statusCode);
      console.log('API Title:', json.data?.title);
      console.log('API Status:', json.data?.status);
      console.log('Modules Count:', json.data?.modules?.length);
      console.log('Total RoadmapDays in response:', json.data?.roadmapDays?.length);
      console.log('Day 1 Title:', json.data?.roadmapDays?.[0]?.title);
      console.log('Day 1 Tasks Count:', json.data?.roadmapDays?.[0]?.tasks?.length);
      console.log('Day 7 Title:', json.data?.roadmapDays?.[6]?.title);
      console.log('Day 70 Title:', json.data?.roadmapDays?.[69]?.title);
      console.log('Day 70 Tasks:', json.data?.roadmapDays?.[69]?.tasks?.map(t => t.title));
    } catch (e) {
      console.error('Error parsing JSON:', e.message, data.slice(0, 200));
    }
  });
}).on('error', (err) => console.error('Request error:', err.message));

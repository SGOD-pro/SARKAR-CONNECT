const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./public/schemes.json', 'utf8'));

console.log('Total schemes:', data.schemes.length);
console.log('\nSchemes by category:');

const categories = {};
data.schemes.forEach(s => {
  categories[s.category] = (categories[s.category] || 0) + 1;
});

Object.entries(categories).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

console.log('\nAll schemes:');
data.schemes.forEach((s, i) => {
  console.log(`${i+1}. ${s.id} - ${s.name}`);
});

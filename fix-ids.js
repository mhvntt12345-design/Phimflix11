const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'js/nguonc-data.js');

if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, 'utf8');
    const match = data.match(/window\.pfMovies\s*=\s*(\[[\s\S]*\]);?/);
    if(match) {
        const movies = JSON.parse(match[1]);
        let maxId = Math.max(...movies.map(m => m.id));
        const seen = new Set();
        let fixed = 0;
        movies.forEach(m => {
            if(seen.has(m.id)) {
                maxId++;
                m.id = maxId;
                fixed++;
            }
            seen.add(m.id);
        });
        
        let newData = data.replace(match[0], `window.pfMovies = ${JSON.stringify(movies, null, 2)};`);
        // Update the timestamp so localStorage in browser resets the cache
        newData = newData.replace(/window\.pfMoviesUpdateStamp\s*=\s*\d+;/, `window.pfMoviesUpdateStamp = ${Date.now()};`);
        
        fs.writeFileSync(dataFile, newData);
        console.log(`Fixed ${fixed} duplicate IDs.`);
    } else {
        console.log('No pfMovies array found.');
    }
} else {
    console.log('File does not exist.');
}

function skipToContent(){
    const content = document.getElementById("content");
    content.scrollIntoView({behavior: "smooth"});
}

// function playInDashboard(title) {
//     const player = document.getElementById('music-player');
//     const info = document.getElementById('track-info');
//     const container = document.getElementById('video-container');

//     player.style.display = 'block';

//     const searchQuery = encodeURIComponent(`${title} drum and bass`);
//     container.innerHTML = `<iframe width="100%" height="150" src="https://www.youtube.com/embed?listType=search&list=${searchQuery}" frameborder="0" allow="autoplay"></iframe>`;
//     console.log(`https://www.youtube.com/embed?listType=search&list=${searchQuery}`);
// }

/*
Visualization 1: country-based geographic distribution of releases from 5-year increments with clusters of datapoints
Hovering over a cluster will show the number of releases from that geographic area and the top 5 releases from that area
*/

const periods = ["1990-1994", "1995-1999", "2000-2004", "2005-2009", "2010-2014", "2015-2019", "2020-2024"];
let map = L.map('map').setView([35, 0], 3); // Start with a world view
let layerGroup = L.layerGroup().addTo(map);
map.attributionControl.setPrefix('');

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);

async function updateMap(index) {
    const period = periods[index];
    document.getElementById('period-display').innerText = period;
    
    // Clear old markers
    layerGroup.clearLayers();

    try {
        const response = await fetch(`assets/map_data/dnb_viz_${period}_releases.json`);

        if (!response.ok) {
            throw new Error(`Failed to load data (${response.status} ${response.statusText})`);
        }

        const data = await response.json();

        data.forEach(item => {
            const radius = Math.sqrt(item.release_count) * 2.5; // scale radius based on release count 

            const lat = item.coordinates.lat;
            const lng = item.coordinates.lng;

            const circle = L.circleMarker([lat, lng], {
                radius: radius,
                color: '#00ff00',
                fillOpacity: 0.3
            });

            let top5Html = `<b>${item.country}</b><br>Total Releases: ${item.release_count}<hr><b>Top 5 Releases:</b><ul>`;
            item.top_releases.forEach(s => {
                top5Html += `
                    <li style="display:flex; align-items:center;">
                        <img src="${s.image_url}" alt="Cover" style="width:40px; height:40px; margin-right:10px; object-fit:cover; border-radius:4px;">
                        <a href="https://www.discogs.com${s.release_url}" target="_blank" style="font-size: 12px;text-decoration:none;">
                        ${s.title}
                        </a>
                    </li>
                `;
                // cover image
            });
            top5Html += `</ul>`;

            circle.bindPopup(top5Html);
            circle.addTo(layerGroup);

            // circle.on('click', () => {
            //     if (item.top_releases.length > 0) {
            //         const topRelease = item.top_releases[0];
            //         playInDashboard(topRelease.title);
            //     }
            // });
        });
    } catch (error) {
        console.error('Error loading map data:', error);
    }
}

// Listener for the slider
document.getElementById('year-slider').addEventListener('input', (e) => {
    updateMap(e.target.value);
});

// Initial Load
updateMap(0);
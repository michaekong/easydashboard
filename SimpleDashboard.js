class SimpleDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error('Le conteneur spécifié n\'a pas été trouvé');
        }
        this.container.innerHTML = ''; // Nettoyer le conteneur au démarrage
    }

    // Méthode générique pour ajouter des graphiques (avec types de graphiques supportés : ligne, barre, radar, etc.)
    addChart(title, type, config = {}) {
        const validTypes = ['line', 'bar', 'radar', 'doughnut', 'pie', 'polarArea', 'bubble', 'scatter', 'boxplot', 'violin'];
        
        if (!validTypes.includes(type)) {
            throw new Error(`Type de graphique "${type}" non pris en charge. Types valides : ${validTypes.join(', ')}`);
        }

        const section = this._createSection(title);
        const canvas = document.createElement('canvas');
        section.appendChild(canvas);

        const options = config.options || {};  // Options par défaut si aucune option n'est fournie
        const data = config.data || {};  // Données par défaut si aucune donnée n'est fournie

        new Chart(canvas.getContext('2d'), {
            type: type,
            data: data,
            options: options
        });
    }

// Méthode pour ajouter une carte interactive
addMap(title, center, zoom = 13, mapHeight = '400px') {
    // Créer une section pour la carte
    const section = this._createSection(title);
    const mapContainer = document.createElement('div');
    mapContainer.style.height = mapHeight;  // Hauteur configurable pour la carte
    section.appendChild(mapContainer);

    // Initialisation de la carte avec Leaflet.js
    const map = L.map(mapContainer).setView(center, zoom);

    // Définitions des différentes couches de base pour la carte
    const baseMaps = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }),
        "Satellite": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: '© OpenTopoMap contributors'
        }),
        "CartoDB Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '© CartoDB contributors'
        })
    };

    // Ajouter la couche de base par défaut
    baseMaps["OpenStreetMap"].addTo(map);

    // Ajout des outils de dessin à la carte
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawOptions = {
        shapeOptions: {
            color: '#FF0000',
            fillColor: '#FF0000',
            fillOpacity: 0.3,
            weight: 2,
            opacity: 1
        }
    };

    const drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
            polyline: drawOptions,
            polygon: drawOptions,
            rectangle: drawOptions,
            circle: true,
            marker: {
                icon: new L.Icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });

    map.addControl(drawControl);

    // Fonction pour calculer les propriétés des formes dessinées
    const calculateProperties = (layer) => {
        let properties = {};
        if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
            const latlngs = layer.getLatLngs()[0];
            properties.area = L.GeometryUtil.geodesicArea(latlngs); // Aire en mètres carrés
            properties.perimeter = 0;
            for (let i = 0; i < latlngs.length; i++) {
                const nextIndex = (i + 1) % latlngs.length;
                properties.perimeter += latlngs[i].distanceTo(latlngs[nextIndex]);
            }
        } else if (layer instanceof L.Polyline) {
            const latlngs = layer.getLatLngs();
            properties.length = 0;
            for (let i = 0; i < latlngs.length - 1; i++) {
                properties.length += latlngs[i].distanceTo(latlngs[i + 1]);
            }
        }
        return properties;
    };

    // Événements de dessin pour ajouter des propriétés calculées aux formes
    map.on(L.Draw.Event.CREATED, (event) => {
        const layer = event.layer;
        let properties = {};

        if (event.layerType === 'marker') {
            const coords = layer.getLatLng();
            properties = { type: "Point", latitude: coords.lat, longitude: coords.lng };
            layer.bindTooltip(
                `<strong>Point</strong><br>Latitude: ${coords.lat.toFixed(6)}<br>Longitude: ${coords.lng.toFixed(6)}`,
                { permanent: false }
            );
        }

        if (event.layerType === 'polygon' || event.layerType === 'rectangle') {
            properties = calculateProperties(layer);
            layer.bindTooltip(
                `<strong>Polygone</strong><br>Aire: ${(properties.area / 1000000).toFixed(2)} km²<br>Périmètre: ${properties.perimeter.toFixed(2)} m`,
                { permanent: false }
            );
        }

        if (event.layerType === 'polyline') {
            properties = calculateProperties(layer);
            layer.bindTooltip(
                `<strong>Ligne</strong><br>Longueur: ${properties.length.toFixed(2)} m`,
                { permanent: false }
            );
        }

        // Ajouter les propriétés calculées au layer
        layer.properties = properties;

        // Ajouter le layer au groupe de formes dessinées
        drawnItems.addLayer(layer);
    });
}

    // Méthode privée pour créer une section avec un titre
    _createSection(title) {
        const section = document.createElement('div');
        section.className = 'dashboard-section';

        const heading = document.createElement('h3');
        heading.textContent = title;
        section.appendChild(heading);

        this.container.appendChild(section);
        return section;
    }
}

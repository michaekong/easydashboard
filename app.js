// Créer le dashboard
const dashboard = new SimpleDashboard('dashboard');

// Ajouter un graphique en ligne
dashboard.addLineChart('Ventes Mensuelles', {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai'],
    datasets: [{
        label: 'Ventes 2024',
        data: [65, 59, 80, 81, 56],
        borderColor: 'rgb(75, 192, 192)'
    }]
});

// Ajouter un graphique en barres
dashboard.addBarChart('Revenus par Produit', {
    labels: ['Produit A', 'Produit B', 'Produit C'],
    datasets: [{
        label: 'Revenus',
        data: [12000, 19000, 3000],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56']
    }]
});

// Ajouter une carte
const map = dashboard.addMap('Nos Magasins', [48.8566, 2.3522]);

// Ajouter un marqueur sur la carte
L.marker([48.8566, 2.3522])
    .bindPopup('Magasin Principal')
    .addTo(map);
# Tâches

## Jessica
- Renvoyer la liste des livres
- Renvoyer le détail d'un livre 

## Abdourahmane
- Décrémenter le stock après : 
  - un paiement en cours
  - un paiement réussi
- Incrémenter le stock après : 
  - un paiement échoué
  - un abandon de panier

## Benjamin
- Doc API (swagger ?) - Benjamin

## Hicham
- Pipelines (CI/CD)

## À réaliser
- Filtres (parametre de recherche)

### Books list
```json
[
  {
    "id": 1,
    "title": "Dune",
    "type": "NOVEL",
    "genre": "SCIENCE_FICTION",
    "price": 9.90,
    "quantity": 12,
    "authors": [
      {
        "id": 1,
        "firstname": "Frank",
        "lastname": "Herbert"
      }
    ]
  }
]
```

### Book detail
```json
{
  "id": 1,
  "title": "Dune",
  "isbn": "978-2-07-036024-1",
  "type": "NOVEL",
  "genre": "SCIENCE_FICTION",
  "price": 9.90,
  "description": "Un roman de science-fiction épique...",
  "publisher": "Éditions Robert Laffont",
  "publicationDate": "1965-08-01",
  "quantity": 12,
  "authors": [
    {
      "id": 1,
      "firstname": "Frank",
      "lastname": "Herbert"
    }
  ]
}
```
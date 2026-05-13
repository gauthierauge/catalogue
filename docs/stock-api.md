# API Stock - Service Catalogue

Cette API permet aux services panier, commande et paiement de reserver ou liberer le stock des livres.

## Route unique

```http
PATCH /api/books/stock-events
Content-Type: application/json
x-idempotency-key: order-123-reserved
```

## Idempotence

Le header `x-idempotency-key` est obligatoire.

Il doit etre unique par evenement de stock. Pour une meme commande, on garde le meme identifiant metier, mais on change le suffixe selon l'etape :

```txt
order-123-reserved
order-123-success
order-123-failed
```

Ne pas reutiliser exactement la meme cle pour `RESERVED`, `SUCCESS` et `FAILED`.

## Payload

```json
{
  "status": "RESERVED",
  "items": [
    {
      "bookId": 1,
      "quantity": 2
    },
    {
      "bookId": 4,
      "quantity": 1
    }
  ]
}
```

Il n'y a pas de `paymentId` dans ce payload. La reference de l'evenement est la cle d'idempotence.

## Statuts

```txt
RESERVED => reserve les livres, decremente le stock
SUCCESS  => confirme la reservation, ne modifie pas le stock
FAILED   => annule la reservation, incremente le stock
```

Flow normal :

```txt
RESERVED -> SUCCESS
RESERVED -> FAILED
```

## Exemple reservation

```http
PATCH /api/books/stock-events
Content-Type: application/json
x-idempotency-key: order-123-reserved
```

```json
{
  "status": "RESERVED",
  "items": [
    {
      "bookId": 1,
      "quantity": 2
    },
    {
      "bookId": 4,
      "quantity": 1
    }
  ]
}
```

## Exemple paiement valide

```http
PATCH /api/books/stock-events
Content-Type: application/json
x-idempotency-key: order-123-success
```

```json
{
  "status": "SUCCESS",
  "items": [
    {
      "bookId": 1,
      "quantity": 2
    },
    {
      "bookId": 4,
      "quantity": 1
    }
  ]
}
```

## Exemple paiement echoue

```http
PATCH /api/books/stock-events
Content-Type: application/json
x-idempotency-key: order-123-failed
```

```json
{
  "status": "FAILED",
  "items": [
    {
      "bookId": 1,
      "quantity": 2
    },
    {
      "bookId": 4,
      "quantity": 1
    }
  ]
}
```

## Reponse

```json
{
  "items": [
    {
      "bookId": 1,
      "status": "RESERVED",
      "quantity": 10,
      "alreadyProcessed": false
    },
    {
      "bookId": 4,
      "status": "RESERVED",
      "quantity": 7,
      "alreadyProcessed": false
    }
  ]
}
```

Dans la reponse, `quantity` correspond au stock restant apres l'operation.

Si `alreadyProcessed` vaut `true`, cela veut dire que la meme cle d'idempotence a deja ete traitee.

## Erreurs possibles

Header `x-idempotency-key` manquant :

```json
{
  "message": "Missing x-idempotency-key header",
  "error": "Bad Request",
  "statusCode": 400
}
```

Stock insuffisant :

```json
{
  "message": "Not enough stock available for book 1",
  "error": "Bad Request",
  "statusCode": 400
}
```

Livre introuvable :

```json
{
  "message": "Book 1 not found",
  "error": "Not Found",
  "statusCode": 404
}
```

# API Stock - Service Catalogue

Base URL :

```http
/api/books
```

Tous les appels doivent envoyer une cle d'idempotence :

```http
x-idempotency-key: une-cle-unique
```

Cette cle identifie l'evenement de stock et evite de modifier le stock plusieurs fois si le meme evenement est renvoye.

Exemples de cles :

```txt
cart-123-reserved
order-123-success
order-123-failed
```

## Route principale a utiliser

```http
PATCH /api/books/stock-events
Content-Type: application/json
x-idempotency-key: order-123-reserved
```

Payload :

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

## Statuts possibles

```txt
RESERVED => reservation du panier ou de la commande, decremente le stock
SUCCESS  => paiement valide, confirme la reservation, ne modifie pas le stock
FAILED   => paiement echoue ou commande annulee, libere la reservation, incremente le stock
```

Le chemin normal est :

```txt
RESERVED -> SUCCESS
RESERVED -> FAILED
```

## Exemple reservation panier

```http
PATCH /api/books/stock-events
Content-Type: application/json
x-idempotency-key: cart-123-reserved
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


```json
{
  "id": "backend-service-id",
  "algorithm": "round-robin",
  "port": 4040,
  "servers": [
    {
      "host": "localhost",
      "port": 3000,
      "readinessProbe": {
        "url": "/ping"
      },
      "weight": 3
    },
    {
      "host": "localhost",
      "port": 3001,
      "readinessProbe": {
        "url": "/ping"
      },
      "weight": 1
    }
  ]
}
```

### `algorithm`
Options
- round-robin
- least-connection

`weighted-?`

### `servers.weight`

# Bancer
Bancer is a load balancer written in Node.js.

## Configuration
```json
{
  "id": "backend-service-id",
  "algorithm": "round-robin",
  "port": 4040,
  "workers": 4,
  "servers": [
    {
      "id": "server-1",
      "host": "localhost",
      "port": 3001,
      "weight": 2,
      "livenessProbe": {
        "path": "/ping",
        "periodSeconds": 5
      }
    },
    {
      "id": "server-2",
      "host": "localhost",
      "port": 3002,
      "livenessProbe": {
        "path": "/ping",
        "periodSeconds": 5
      }
    }
  ]
}
```

### `id` -> `string`
Identifier for running multiple load balancer on the same thread

### `algorithm` -> `round-robin` | `least-connection` | `random` [default: `round-robin`]
Defaults to `round-robin`.

### `port` -> `number`
The `port` your load balancer is listening on.

### `workers` -> `number` | `"unlimited"` [default: `1`]
Built-in support for Node.js cluster mode. Defaults to 1. Maximum is number of available CPUs. If you set a number higher than there are available CPUs, `bancer` will gracefully fallback to the number of CPUs and show a warning.

### `servers.id` -> `string` | `undefined`
Identifier for each target server. Must be unique across different targets. If you set the same `id` on 2 or more servers, `bancer` will throw an error and quit it's process.

### `servers.host` -> `number`
Host the target server is running on.

### `servers.port` -> `number`
Port number the target server is running on. Must be unique across target servers.

### `servers.weight` -> `numnber` [default: `1`]
The ratio of traffic routed to the target servers. Higher weight means higher number of request.

### `servers.livenessProbe`

### `servers.livenessProbe.path`

### `servers.livenessProbe.periodSeconds`

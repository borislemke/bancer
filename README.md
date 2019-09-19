# Bancer

Bancer is a load balancer written in Node.js.
Dislaimer: This is a weekend project not meant to be used in production. I decided to take the load balancer as a subject to better understand the Node.js runtime and the JavaScript event loop.

## Features

### SSL Offloading

Bancer has built in support for TLS termination. Set the `ssl` field in the `json` config file and Bancer will spin up a HTTPS server. Bancer supports offloading standard 1024-bit and 2048-bit SSL keys.

### Health Check and Retry

When a target server is unavailable or abruptly killed while requests are ditributed to the problematic server, Bancer will attempt to retry the failed connections to other available servers.

## Configuration

```jsonc
{
  "id": "backend-service-id",
  "algorithm": "round-robin",
  "port": 4040,
  "workers": 4,
  "ssl": {
    "cert": "~path/to/server.crt",
    "key": "~path/to/server.key"
  },
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
      "weight": 3,
      "livenessProbe": {
        "path": "/ping",
        "periodSeconds": 5
      }
    }
  ]
}
```

### id -> `string`

Identifier for running multiple load balancer on the same thread

### algorithm -> `round-robin` | `least-connection` | `random` [default: `round-robin`]

Defaults to `round-robin`.

### port -> `number`

The `port` your load balancer is listening on.

### workers -> `number` | `"auto"` [default: `1`]

Built-in support for Node.js cluster mode. Defaults to 1. Maximum is number of available CPUs. If you set a number higher than there are available CPUs, `bancer` will gracefully fallback to the number of CPUs and show a warning.

### servers.id -> `string` | `undefined`

Identifier for each target server. Must be unique across different targets. If you set the same `id` on 2 or more servers, `bancer` will throw an error and quit it's process.

### servers.host -> `number`

Host the target server is running on.

### servers.port -> `number`

Port number the target server is running on. Must be unique across target servers.

### servers.weight -> `numnber` [default: `1`]

The ratio of traffic routed to the target servers. Higher weight means higher number of request.

### servers.livenessProbe

Liveness probe to know if a serve is ready to receive load. Periodical check will ensure traffic is directed at healthy servers only.

### servers.livenessProbe.path

### servers.livenessProbe.periodSeconds

## Todo

- [ ] HTTP to HTTPS redirection
- [ ] Monitoring and Configuration UI
- [ ] Queue and retry if no servers available
- [ ] HTTP/2 Support
- [ ] Native IPv6 Support
- [ ] Content-based Routing (Host, Path, Headers, Method, Source IP, Device etc.)
- [ ] WebSocket Support
- [ ] Sticky Sessions
- [ ] Logging
- [ ] Slow Start Mode
- [ ] Fixed Response
- [ ] Data Compression

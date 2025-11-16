# PakLog Infrastructure

Comprehensive infrastructure setup for the PakLog logistics platform, providing data persistence, event streaming, real-time analytics, and complete observability stack.

## Overview

This infrastructure stack provides:

- **Event Streaming**: Kafka with Zookeeper for distributed messaging
- **Caching**: Redis for high-performance data caching
- **Document Storage**: MongoDB for flexible schema storage
- **Real-time Analytics**: Apache Pinot for OLAP queries
- **Observability**: Complete monitoring, logging, and tracing with Prometheus, Loki, Tempo, and Grafana

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PakLog Services                           │
│  (product-catalog, order-management, cartonization, etc.)        │
└────────────────────┬────────────────────────────────────────────┘
                     │
     ┌───────────────┴────────────────┐
     │                                 │
┌────▼────────┐                  ┌───▼──────────┐
│   Kafka     │◄─────────────────┤  Zookeeper   │
│  (Events)   │                  │ (Coordination)│
└─────────────┘                  └──────────────┘
     │
     ├────────────┬─────────────┬──────────────┐
     │            │             │              │
┌────▼─────┐ ┌──▼────────┐ ┌──▼─────────┐ ┌─▼──────────┐
│  Redis   │ │  MongoDB  │ │   Pinot    │ │ Observ.    │
│ (Cache)  │ │ (Storage) │ │ (Analytics)│ │ Stack      │
└──────────┘ └───────────┘ └────────────┘ └────────────┘
                                           │
                                           ├─ Prometheus
                                           ├─ Loki
                                           ├─ Tempo
                                           └─ Grafana
```

## Components

### Data Infrastructure

#### Kafka (Port 9092)
- **Purpose**: Distributed event streaming platform
- **Use Cases**: Inter-service communication, event sourcing, real-time data pipelines
- **Configuration**:
  - Bootstrap servers: `localhost:9092`
  - Auto topic creation enabled
  - Single broker setup (suitable for development/staging)
- **Health Check**: Topic listing via Kafka CLI

#### Zookeeper (Port 2181)
- **Purpose**: Coordination service for Kafka
- **Configuration**: Standard client port 2181
- **Data Persistence**: Separate volumes for data and logs
- **Health Check**: Four-letter word command 'ruok'

#### Redis (Port 6379)
- **Purpose**: In-memory data store and cache
- **Use Cases**: Session storage, rate limiting, temporary data, query caching
- **Configuration**:
  - AOF persistence enabled
  - Alpine-based lightweight image
- **Health Check**: PING command

#### MongoDB (Port 27017)
- **Purpose**: Document-oriented NoSQL database
- **Use Cases**: Product catalog, flexible schema storage
- **Configuration**:
  - Automatic initialization scripts for collections
  - Integration with product-catalog and cartonization services
- **Health Check**: Admin ping command

### Analytics Platform

#### Apache Pinot
A real-time distributed OLAP datastore designed for low-latency analytics.

**Components:**

1. **Pinot Controller** (Port 9000)
   - Manages cluster metadata and coordination
   - Handles table/schema operations
   - Web UI for administration

2. **Pinot Broker** (Port 8099)
   - Routes queries to appropriate servers
   - Aggregates results from servers
   - Query endpoint for applications

3. **Pinot Server** (Port 8098)
   - Stores and serves data segments
   - Executes query fragments
   - Handles data ingestion

**Use Cases:**
- Real-time dashboards
- User-facing analytics
- Time-series analysis
- Aggregated metrics

### Observability Stack

#### Prometheus (Port 9090)
- **Purpose**: Metrics collection and time-series database
- **Features**:
  - 30-day data retention
  - Remote write receiver enabled
  - Lifecycle API enabled for hot reload
- **Configuration**: `prometheus.yml`
- **Health Check**: HTTP health endpoint

#### Loki (Port 3100)
- **Purpose**: Log aggregation system
- **Features**:
  - Prometheus-style labels for logs
  - Optimized for Docker networking (instance_addr: 0.0.0.0)
  - Efficient log storage and querying
- **Configuration**: `loki-config.yml`
- **Health Check**: Ready endpoint

#### Tempo (Port 3200, 4317-4318, 9095, 14268, 9411)
- **Purpose**: Distributed tracing backend
- **Features**:
  - OpenTelemetry compatible (gRPC: 4317, HTTP: 4318)
  - Jaeger ingestion support (14268)
  - Zipkin ingestion support (9411)
  - Tempo gRPC API (9095)
- **Configuration**: `tempo-config.yml`
- **Health Check**: Ready endpoint

#### Grafana (Port 3000)
- **Purpose**: Unified observability dashboard
- **Features**:
  - Pre-configured datasources (Prometheus, Loki, Tempo, MongoDB)
  - TraceQL support for advanced trace queries
  - MongoDB plugin for database monitoring
- **Credentials**:
  - Username: `admin`
  - Password: `admin`
- **Configuration**: `grafana-datasources.yml`
- **Health Check**: API health endpoint

## Getting Started

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 8GB RAM available for Docker
- Ports 3000, 3100, 3200, 4317-4318, 6379, 8098-8099, 9000, 9090, 9092, 9095, 9411, 14268, 27017 available

### Starting the Infrastructure

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service health
docker-compose ps
```

### Stopping the Infrastructure

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

### Verifying Services

```bash
# Check Kafka
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check Redis
docker-compose exec redis redis-cli ping

# Check MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Access Grafana
open http://localhost:3000
```

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Grafana | http://localhost:3000 | Observability dashboards |
| Prometheus | http://localhost:9090 | Metrics and alerts |
| Loki | http://localhost:3100 | Log queries |
| Tempo | http://localhost:3200 | Trace queries |
| Pinot Controller | http://localhost:9000 | Pinot admin UI |
| Pinot Broker | http://localhost:8099 | Query endpoint |
| Kafka | localhost:9092 | Event streaming |
| Redis | localhost:6379 | Caching |
| MongoDB | localhost:27017 | Document storage |

## Configuration Files

- `docker-compose.yml` - Main service definitions
- `prometheus.yml` - Prometheus scrape configuration
- `loki-config.yml` - Loki server configuration
- `tempo-config.yml` - Tempo distributor and storage configuration
- `grafana-datasources.yml` - Pre-configured datasources

## Data Persistence

All services use Docker volumes for data persistence:

| Volume | Purpose |
|--------|---------|
| `kafka_data` | Kafka message logs |
| `zookeeper_data`, `zookeeper_log` | Zookeeper state |
| `redis_data` | Redis AOF and RDB files |
| `mongodb_data` | MongoDB collections |
| `pinot_controller_data` | Pinot metadata |
| `pinot_broker_data`, `pinot_server_data` | Pinot segments |
| `prometheus_data` | Metrics time-series data |
| `loki_data` | Log chunks and indexes |
| `tempo_data` | Trace data |
| `grafana_data` | Dashboards and settings |

## Network

All services communicate via the `paklog-network` bridge network, enabling:
- Service discovery by container name
- Network isolation
- Inter-service communication without exposing ports

## Health Checks

All critical services have health checks configured:
- Automatic restart on failure
- Dependency management (services wait for dependencies to be healthy)
- Status visibility via `docker-compose ps`

## Observability Integration

### Metrics (Prometheus)
Configure your services to expose metrics at `/metrics` endpoint and add scrape targets to `prometheus.yml`.

### Logs (Loki)
Use the Loki Docker driver or Promtail to ship logs:
```bash
docker run --log-driver=loki \
  --log-opt loki-url="http://localhost:3100/loki/api/v1/push" \
  your-service
```

### Traces (Tempo)
Configure OpenTelemetry in your services:
```yaml
exporters:
  otlp:
    endpoint: http://localhost:4317
```

## Troubleshooting

### Services won't start
```bash
# Check logs for specific service
docker-compose logs [service-name]

# Verify port availability
netstat -an | grep [port]
```

### Out of memory errors
```bash
# Increase Docker memory limit in Docker Desktop settings
# Minimum recommended: 8GB
```

### Permission errors (Loki)
The Loki service runs as root to handle volume permissions in Docker environments.

### Kafka connection issues
Ensure you're using the correct listener:
- From host: `localhost:9092`
- From containers: `kafka:29092`

## Performance Tuning

### Production Recommendations

1. **Kafka**:
   - Increase replication factor (min 3)
   - Tune retention policies
   - Add more brokers for horizontal scaling

2. **MongoDB**:
   - Enable authentication
   - Configure replica sets
   - Add appropriate indexes

3. **Pinot**:
   - Add more servers for data distribution
   - Configure table retention policies
   - Optimize segment sizes

4. **Observability**:
   - Increase Prometheus retention
   - Configure Loki compaction
   - Set up remote storage for long-term retention

## Security Considerations

**Development Setup**: Current configuration is optimized for development and uses default credentials.

**For Production**:
- Enable authentication for all services
- Use secrets management (e.g., Docker secrets, Vault)
- Configure TLS/SSL for all connections
- Implement network policies
- Regular security updates
- Change default Grafana credentials

## Monitoring

Access Grafana at http://localhost:3000 to monitor:
- Infrastructure metrics (CPU, memory, disk)
- Service-specific metrics
- Application logs
- Distributed traces
- Custom dashboards

## Support

For issues or questions:
- Check service logs: `docker-compose logs [service]`
- Review configuration files
- Consult official documentation for each component

## License

Part of the PakLog logistics platform.

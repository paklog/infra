# Observability Stack Setup Guide

## Overview
This guide explains how to configure all Paklog microservices to send metrics, logs, and traces to the observability stack (Prometheus, Loki, Tempo, Grafana).

## Services Configured
- ✅ product-catalog
- ✅ order-management
- ✅ shipment-transportation
- ✅ inventory
- ✅ cartonization
- ✅ wave-planning-service

## Dependencies Added

All services now include:
- `micrometer-registry-prometheus` - Prometheus metrics exporter
- `micrometer-tracing-bridge-otel` - OpenTelemetry tracing bridge
- `opentelemetry-exporter-otlp` - OTLP exporter for traces
- `loki-logback-appender` - Loki log aggregation

## Configuration Steps for Each Service

### 1. Copy logback-spring.xml

Copy `/infra/logback-spring.xml` to each service's `src/main/resources/` directory:

```bash
for service in product-catalog order-management shipment-transportation inventory cartonization wave-planning-service; do
  cp infra/logback-spring.xml ../$service/src/main/resources/logback-spring.xml
done
```

### 2. Update application.yml

Add the following configuration to each service's `application.yml` under the `management:` section:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true
    tags:
      application: ${spring.application.name}
      environment: dev
  tracing:
    sampling:
      probability: 1.0  # 100% sampling for dev, reduce in production
  otlp:
    tracing:
      endpoint: http://localhost:4318/v1/traces
  loki:
    url: http://localhost:3100
```

### 3. Update application-docker.yml

For services running in Docker, update `application-docker.yml` to point to Docker network hostnames:

```yaml
management:
  otlp:
    tracing:
      endpoint: http://tempo:4318/v1/traces
  loki:
    url: http://loki:3100
```

## Docker Compose Integration

The observability stack includes:

### Prometheus
- **Port**: 9090
- **Config**: `prometheus.yml`
- **Scrapes**: All service metrics endpoints at `/actuator/prometheus`

### Loki
- **Port**: 3100
- **Config**: `loki-config.yml`
- **Receives**: Logs from all services via loki4j-logback-appender

### Tempo
- **Ports**:
  - 3200 (HTTP API)
  - 4317 (OTLP gRPC)
  - 4318 (OTLP HTTP) ← Services use this
  - 14268 (Jaeger)
  - 9411 (Zipkin)
- **Config**: `tempo-config.yml`
- **Receives**: Traces via OTLP protocol

### Grafana
- **Port**: 3000
- **Credentials**: admin/admin
- **Datasources**: Pre-configured for Prometheus, Loki, Tempo with correlation

## Starting the Stack

```bash
cd infra
docker-compose up -d

# Check all services are healthy
docker-compose ps

# View logs
docker-compose logs -f grafana prometheus loki tempo
```

## Accessing the Observability Tools

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100
- **Tempo**: http://localhost:3200

## Verifying Configuration

### 1. Check Metrics
```bash
# Check if service exposes metrics
curl http://localhost:8082/actuator/prometheus

# Check Prometheus targets
# Go to http://localhost:9090/targets
```

### 2. Check Logs in Loki
```bash
# Query logs via Loki API
curl -G -s "http://localhost:3100/loki/api/v1/query" \
  --data-urlencode 'query={service="product-catalog"}' | jq

# Or use Grafana Explore with LogQL:
{service="product-catalog"} |= "DEBUG"
```

### 3. Check Traces in Tempo
```bash
# Generate some traffic to create traces
curl http://localhost:8082/api/v1/products

# Search traces in Grafana:
# - Go to Explore
# - Select Tempo datasource
# - Search by service name or trace ID
```

## Grafana Dashboards

### Recommended Dashboards to Import:

1. **Spring Boot Dashboard** (ID: 12900)
   - JVM metrics, HTTP requests, database connections

2. **Loki Dashboard** (ID: 13639)
   - Log volume, log levels, error rates

3. **Tempo Dashboard** (ID: 16698)
   - Trace statistics, service dependencies

To import:
1. Go to Grafana → Dashboards → Import
2. Enter dashboard ID
3. Select appropriate datasources

## Correlation Between Signals

The stack is configured for automatic correlation:

- **Logs → Traces**: Click trace_id in logs to jump to corresponding trace
- **Traces → Logs**: Click on span to see related logs
- **Traces → Metrics**: Service graphs generated from traces
- **Metrics → Traces**: Exemplars link metrics to traces

## Production Considerations

1. **Sampling**: Reduce `management.tracing.sampling.probability` to 0.1 (10%) in production
2. **Retention**: Configure longer retention in:
   - Prometheus: `--storage.tsdb.retention.time=90d`
   - Loki: `limits_config.retention_period: 90d`
   - Tempo: `compactor.compaction.block_retention: 168h`
3. **Security**: Enable authentication and TLS for all components
4. **Resource Limits**: Set appropriate memory/CPU limits in docker-compose
5. **High Availability**: Deploy multiple replicas of each component

## Troubleshooting

### No Metrics Appearing
- Check service actuator endpoint: `curl http://localhost:PORT/actuator/prometheus`
- Verify Prometheus scrape configuration
- Check Prometheus targets page for errors

### No Logs in Loki
- Check logback-spring.xml is in classpath
- Verify Loki URL is accessible from service
- Check Loki logs: `docker-compose logs loki`

### No Traces in Tempo
- Verify OTLP endpoint is accessible
- Check trace sampling probability > 0
- Generate traffic to create traces
- Check Tempo logs: `docker-compose logs tempo`

## OpenTelemetry Environment Variables (Alternative)

If you prefer environment-based configuration:

```bash
export OTEL_SERVICE_NAME=product-catalog
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
export OTEL_TRACES_EXPORTER=otlp
export OTEL_METRICS_EXPORTER=none
export OTEL_LOGS_EXPORTER=none
```

## Next Steps

1. Copy logback-spring.xml to all services
2. Update all application.yml files with management configuration
3. Rebuild all services: `mvn clean package -DskipTests`
4. Start observability stack: `docker-compose up -d`
5. Start microservices and generate traffic
6. Access Grafana and explore metrics, logs, and traces

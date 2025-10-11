# Observability Configuration Summary

## ✅ Completed Configuration

All microservices have been successfully configured with the observability stack.

## 📊 Observability Stack Components

### Infrastructure Services (via Docker Compose)
- **Prometheus** (`:9090`) - Metrics collection and storage
- **Loki** (`:3100`) - Log aggregation and querying
- **Tempo** (`:3200`, `:4318`) - Distributed tracing
- **Grafana** (`:3000`) - Unified observability dashboard

## 🔧 Microservices Configured

### 1. Product Catalog (`:8082`)
- ✅ Dependencies added (OpenTelemetry, Loki, Prometheus)
- ✅ `application.yml` updated with OTLP and Loki endpoints
- ✅ `logback-spring.xml` configured for structured logging

### 2. Order Management (`:8080`)
- ✅ Dependencies added
- ✅ `application.yml` updated
- ✅ `logback-spring.xml` configured

### 3. Warehouse Operations (`:8083`)
- ✅ Dependencies added
- ✅ `application.yml` updated
- ✅ `logback-spring.xml` configured

### 4. Shipment Transportation (`:8086`)
- ✅ Dependencies updated (already had partial observability)
- ✅ `application.yml` enhanced with Loki integration
- ✅ `logback-spring.xml` configured

### 5. Inventory (`:8085`)
- ✅ Dependencies updated
- ✅ `application-metrics.yml` enhanced
- ✅ `logback-spring.xml` configured

### 6. Cartonization (`:8084`)
- ✅ Dependencies added
- ✅ `application.yml` updated
- ✅ `logback-spring.xml` configured

## 📦 Dependencies Added to All Services

```xml
<!-- Prometheus Metrics -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>

<!-- OpenTelemetry Tracing -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>

<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>

<!-- Loki Logging -->
<dependency>
    <groupId>com.github.loki4j</groupId>
    <artifactId>loki-logback-appender</artifactId>
    <version>1.5.1</version>
</dependency>
```

## ⚙️ Configuration Applied

### Application Configuration (application.yml)
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
      probability: 1.0
  otlp:
    tracing:
      endpoint: http://localhost:4318/v1/traces
  loki:
    url: http://localhost:3100
```

### Logging Configuration (logback-spring.xml)
- Structured JSON logging with Logstash encoder
- Async Loki appender with trace correlation
- MDC fields: `trace_id`, `span_id`, `trace_flags`
- Service name and host labels

## 🚀 Quick Start

### 1. Start Observability Stack
```bash
cd infra
docker-compose up -d
```

### 2. Verify Services
```bash
docker-compose ps
# All services should be healthy
```

### 3. Rebuild Microservices
```bash
# From paklog root directory
for service in product-catalog order-management warehouse-operations \
               shipment-transportation inventory cartonization; do
  echo "Building $service..."
  cd $service && mvn clean package -DskipTests && cd ..
done
```

### 4. Start Microservices
Start each microservice in separate terminals:
```bash
# Terminal 1
cd product-catalog && mvn spring-boot:run

# Terminal 2
cd order-management && mvn spring-boot:run

# Terminal 3
cd warehouse-operations && mvn spring-boot:run

# ... and so on
```

### 5. Access Grafana
- URL: http://localhost:3000
- Username: `admin`
- Password: `admin`

## 🔍 Verification Steps

### Check Metrics
```bash
# Product Catalog
curl http://localhost:8082/actuator/prometheus

# Order Management
curl http://localhost:8080/actuator/prometheus

# Check Prometheus targets
open http://localhost:9090/targets
```

### Check Logs
```bash
# Query Loki directly
curl -G -s "http://localhost:3100/loki/api/v1/query" \
  --data-urlencode 'query={service="product-catalog"}' | jq

# Or use Grafana Explore with LogQL
```

### Check Traces
```bash
# Generate traffic
curl http://localhost:8082/api/v1/products
curl http://localhost:8080/api/v1/orders

# View in Grafana > Explore > Tempo datasource
```

## 📈 Grafana Dashboards to Import

1. **Spring Boot 2.1 System Monitor** (ID: 11378)
2. **Spring Boot Statistics** (ID: 12900)
3. **Loki & Promtail** (ID: 13639)
4. **Tempo Dashboard** (ID: 16698)
5. **JVM (Micrometer)** (ID: 4701)

## 🔗 Observability Endpoints

### Prometheus Metrics
- Product Catalog: http://localhost:8082/actuator/prometheus
- Order Management: http://localhost:8080/actuator/prometheus
- Warehouse Operations: http://localhost:8083/actuator/prometheus
- Shipment Transportation: http://localhost:8086/actuator/prometheus
- Inventory: http://localhost:8085/actuator/prometheus
- Cartonization: http://localhost:8084/actuator/prometheus

### Health Checks
Replace `/actuator/prometheus` with `/actuator/health` for health endpoints

### Observability Stack UIs
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Loki**: http://localhost:3100 (API only, use Grafana for UI)
- **Tempo**: http://localhost:3200 (API only, use Grafana for UI)

## 🎯 Features Enabled

### Metrics (Prometheus)
- ✅ JVM metrics (heap, threads, GC)
- ✅ HTTP request metrics
- ✅ Database connection pool metrics
- ✅ Kafka consumer/producer metrics
- ✅ Custom application metrics
- ✅ Exemplars linking metrics to traces

### Logs (Loki)
- ✅ Structured JSON logging
- ✅ Service name labeling
- ✅ Log level filtering
- ✅ Trace ID correlation
- ✅ Async log shipping

### Traces (Tempo)
- ✅ Distributed request tracing
- ✅ Service dependency mapping
- ✅ Span attributes and events
- ✅ Trace to log correlation
- ✅ Trace to metrics correlation via exemplars

### Grafana
- ✅ Unified dashboard for all signals
- ✅ Pre-configured datasources
- ✅ Trace → Logs navigation
- ✅ Logs → Traces navigation
- ✅ Metrics → Traces exemplars
- ✅ Service graph from traces

## 🔒 Production Recommendations

1. **Reduce Sampling**: Set `management.tracing.sampling.probability: 0.1` (10%)
2. **Add Security**: Enable authentication for all observability components
3. **Configure Retention**:
   - Prometheus: 90 days
   - Loki: 90 days
   - Tempo: 7 days
4. **Add Alerting**: Configure Prometheus alerting rules
5. **Scale Components**: Run multiple replicas for high availability
6. **Resource Limits**: Set appropriate CPU/memory limits
7. **TLS Encryption**: Enable TLS for all inter-service communication

## 📝 Configuration Files

### Created
- `/infra/prometheus.yml` - Prometheus scrape configuration
- `/infra/loki-config.yml` - Loki configuration
- `/infra/tempo-config.yml` - Tempo configuration
- `/infra/grafana-datasources.yml` - Grafana datasource provisioning
- `/infra/logback-spring.xml` - Logback template (copied to all services)
- `/infra/OBSERVABILITY_SETUP.md` - Detailed setup guide
- `/infra/CONFIGURATION_SUMMARY.md` - This file

### Modified
- `/infra/docker-compose.yml` - Added observability stack
- All service `pom.xml` files - Added observability dependencies
- All service `application.yml` files - Added observability configuration
- All service `src/main/resources/logback-spring.xml` - Added Loki integration

## 🐛 Troubleshooting

### No Metrics in Prometheus
1. Check service is exposing `/actuator/prometheus`
2. Verify Prometheus scrape config in `prometheus.yml`
3. Check Prometheus targets page for errors: http://localhost:9090/targets

### No Logs in Loki
1. Verify `logback-spring.xml` is in classpath
2. Check Loki URL is accessible: `curl http://localhost:3100/ready`
3. Review service logs for Loki appender errors

### No Traces in Tempo
1. Verify OTLP endpoint is accessible: `curl http://localhost:4318`
2. Check sampling probability > 0
3. Generate traffic to create traces
4. Review Tempo logs: `docker-compose logs tempo`

### Services Can't Connect to Observability Stack
1. Ensure observability stack is running: `docker-compose ps`
2. Check Docker network: `docker network ls`
3. Verify port mappings in `docker-compose.yml`

## 🎓 Next Steps

1. **Import Dashboards**: Import recommended Grafana dashboards
2. **Create Alerts**: Set up Prometheus alerting rules
3. **Custom Dashboards**: Create application-specific dashboards
4. **SLO/SLI**: Define and track service level objectives
5. **Load Testing**: Generate traffic to test observability stack under load
6. **Documentation**: Document custom metrics and log patterns

## 📚 Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Loki LogQL Guide](https://grafana.com/docs/loki/latest/logql/)
- [Tempo TraceQL Guide](https://grafana.com/docs/tempo/latest/traceql/)
- [Spring Boot Observability](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.observability)

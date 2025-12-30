# Performance Troubleshooting Runbook

## Symptoms

### High Latency (P95 > 200ms)

**Check:**
1. Database query performance
   ```sql
   SELECT query, mean_exec_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC 
   LIMIT 10;
   ```

2. External API latency
   ```bash
   curl https://api.example.com/kpi/metrics \
     -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.metrics.reliability.externalApiLatencyP95'
   ```

3. Cache hit rate
   ```bash
   curl https://api.example.com/kpi/metrics \
     -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.metrics.reliability.cacheHitRate'
   ```

**Actions:**
- Add database indexes for slow queries
- Increase cache TTL
- Optimize external API calls (batching, parallelization)
- Scale horizontally if CPU-bound

### High Error Rate (> 0.1%)

**Check:**
1. Error logs
   ```bash
   # Check Sentry or logs
   tail -f logs/error.log | grep ERROR
   ```

2. Circuit breaker status
   ```bash
   curl https://api.example.com/kpi/metrics \
     -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.metrics.reliability.circuitBreakerTrips'
   ```

3. External API failures
   ```bash
   # Check APM spans for errors
   curl https://api.example.com/kpi/metrics \
     -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.performance'
   ```

**Actions:**
- Check external API status
- Review recent deployments
- Check database connectivity
- Review rate limiting configuration

### High Memory Usage

**Check:**
```bash
# Check process memory
ps aux | grep node
```

**Actions:**
- Restart application
- Check for memory leaks
- Increase instance size
- Optimize data structures

## Performance Optimization Checklist

- [ ] Database indexes optimized
- [ ] Query performance analyzed
- [ ] Cache hit rate > 80%
- [ ] Response compression enabled
- [ ] CDN configured for static assets
- [ ] Database connection pooling configured
- [ ] External API calls optimized
- [ ] Load testing completed

## Performance Baselines

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| P95 Latency | < 200ms | [Check KPI] | ⚠️ |
| P99 Latency | < 500ms | [Check KPI] | ⚠️ |
| Error Rate | < 0.1% | [Check KPI] | ⚠️ |
| Cache Hit Rate | > 80% | [Check KPI] | ⚠️ |
| Database Query P95 | < 100ms | [Check KPI] | ⚠️ |

## Escalation

1. **Level 1**: Check KPIs and logs
2. **Level 2**: Review recent changes
3. **Level 3**: Engage infrastructure team
4. **Level 4**: Scale resources or rollback

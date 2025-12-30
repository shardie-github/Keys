# Disaster Recovery Runbook

## Recovery Time Objective (RTO)
**Target**: < 4 hours

## Recovery Point Objective (RPO)
**Target**: < 1 hour

## Backup Procedures

### Automated Backups
- **Frequency**: Daily (configurable)
- **Retention**: 30 days (configurable)
- **Storage**: Cloud storage (S3/GCS)

### Manual Backup
```bash
# Execute backup via API
curl -X POST https://api.example.com/disaster-recovery/backup \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Verify Backup
```bash
# Check backup status
curl https://api.example.com/disaster-recovery/status \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Recovery Procedures

### Database Recovery

1. **Identify latest backup**
   ```sql
   SELECT * FROM backups ORDER BY created_at DESC LIMIT 1;
   ```

2. **Restore database**
   ```bash
   # Supabase: Use dashboard restore or API
   # PostgreSQL: pg_restore
   pg_restore -d database_name backup_file.dump
   ```

3. **Verify data integrity**
   ```sql
   SELECT COUNT(*) FROM user_profiles;
   SELECT COUNT(*) FROM agent_runs;
   ```

### Application Recovery

1. **Redeploy application**
   ```bash
   git checkout main
   npm install
   npm run build
   npm run start
   ```

2. **Verify health**
   ```bash
   curl https://api.example.com/health
   ```

3. **Check KPIs**
   ```bash
   curl https://api.example.com/kpi/health \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

## Test Restore Procedure

Run monthly test restores:

```bash
# Test restore
curl -X POST https://api.example.com/disaster-recovery/test-restore \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"backupId": "backup-1234567890"}'
```

## Communication Plan

1. **Incident Detection**: Alert sent to on-call engineer
2. **Assessment**: Determine severity and impact
3. **Recovery**: Execute recovery procedures
4. **Verification**: Verify system health
5. **Post-Mortem**: Document incident and improvements

## Contact Information

- **On-Call Engineer**: [Contact Info]
- **Database Admin**: [Contact Info]
- **Infrastructure Team**: [Contact Info]

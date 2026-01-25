---
title: "Incident Triage Runbook"
type: "Runbook"
description: "A structured triage flow for production incidents."
tags: [incident, operations, reliability]
last_updated: "2024-05-12"
---
# Incident Triage Runbook

This runbook is a starting point for incident triage. Adapt it to your service topology and on-call policies.

## 1. Establish context

- Confirm impact scope and affected services.
- Identify whether the incident is ongoing or intermittent.
- Assign a primary responder and scribe.

## 2. Stabilize

- Roll back recent changes if needed.
- Reduce blast radius by disabling non-critical workflows.
- Capture logs and metrics before taking destructive actions.

## 3. Investigate

- Review dashboards for error rates, latency, and saturation.
- Check dependencies (queues, databases, third-party APIs).
- Document hypotheses and evidence as you go.

## 4. Communicate

- Post status updates with timestamps and next steps.
- Share what is known, what is unknown, and when the next update is expected.

## 5. Resolve and follow up

- Confirm recovery with monitoring and user reports.
- Schedule a post-incident review.
- Record learnings and required fixes.

#!/bin/bash
# Script to organize internal documentation
# Run with: bash scripts/organize-internal-docs.sh

set -e

# Create internal directories
mkdir -p internal/agent-notes
mkdir -p internal/planning
mkdir -p internal/strategy
mkdir -p internal/execution
mkdir -p internal/audit

# Files to move to internal/agent-notes/ (agent instructions, checklists)
AGENT_FILES=(
  "AGENTS.md"
  "ACTION_CHECKLIST.md"
  "COMPLETE_CHECKLIST.md"
  "HOW_TO_CREATE_PR.md"
  "MERGE_INSTRUCTIONS.md"
  "OPERATOR_RUNBOOK.md"
  "QUICK_SUMMARY.txt"
  "ACCESS_MAP.md"
  "MECHANICS_MAP.md"
)

# Files to move to internal/planning/ (roadmaps, plans, milestones)
PLANNING_FILES=(
  "DEVELOPMENT_ROADMAP.md"
  "ECONOMIC_HARDENING_PLAN.md"
  "GTM_MILESTONES_DELIVERY.md"
  "GTM_STRATEGY.md"
  "WEDGE_STRATEGY_AND_EXECUTION_PLAN.md"
  "STRATEGIC_ANALYSIS_AND_ACTION_PLAN.md"
  "DATABASE_MIGRATION_NEXT_STEPS.md"
  "MIGRATION_020_SQL.md"
  "MIGRATION_COMPLETE.md"
  "MIGRATION_INSTRUCTIONS.md"
  "MIGRATION_STATUS.md"
  "MIGRATION_SYSTEM_COMPLETE.md"
  "MIGRATION_SYSTEM_STATUS.md"
  "MIGRATIONS_AND_NEXT_STEPS_COMPLETE.md"
  "MIGRATIONS_SETUP_COMPLETE.md"
  "RUN_MIGRATION_AND_DEPLOY.md"
  "NEXT_STEPS_COMPLETE.md"
)

# Files to move to internal/strategy/ (strategy, analysis, moat)
STRATEGY_FILES=(
  "DEFENSIVE_MOAT_ANALYSIS.md"
  "DEFENSIVE_MOAT_EXECUTIVE_SUMMARY.md"
  "ECONOMIC_HARDENING_ALL_COMPLETE.md"
  "ECONOMIC_HARDENING_COMPLETE.md"
  "ECONOMIC_HARDENING_EXECUTIVE_SUMMARY.md"
  "ECONOMIC_HARDENING_IMPLEMENTATION_CHECKLIST.md"
  "ECONOMIC_HARDENING_IMPLEMENTATION_COMPLETE.md"
  "COMPETITOR_COMPARISON_TABLE.md"
  "PRIORITY_MATRIX.md"
  "STRATEGIC_ANALYSIS_EXECUTIVE_SUMMARY.md"
  "MOAT_IMPLEMENTATION_COMPLETE.md"
  "MOAT_IMPLEMENTATION_STATUS.md"
)

# Files to move to internal/execution/ (implementation, completion reports)
EXECUTION_FILES=(
  "ALL_PHASES_COMPLETE.md"
  "AUTOMATION_SUMMARY.md"
  "BACKGROUND_EVENT_LOOP.md"
  "CHROME_EXTENSION_COMPLETE.md"
  "COMPLETE_IMPLEMENTATION_SUMMARY.md"
  "COMPLETE_SYSTEM_SUMMARY.md"
  "COMPLETE_WORK_SUMMARY.md"
  "COMPLETION_REPORT.md"
  "DEPLOYMENT.md"
  "DEPLOYMENT_CHECKLIST.md"
  "DEPLOYMENT_COMPLETE.md"
  "DEPLOYMENT_INSTRUCTIONS.md"
  "DEPLOYMENT_STATUS.md"
  "EXECUTE_DEPLOYMENT_NOW.md"
  "EXECUTION_HARDENING_AUDIT_REPORT.md"
  "FINAL_DEPLOYMENT_SUMMARY.md"
  "FINAL_LAUNCH_PRESSURE_AUDIT_AND_POLISH.md"
  "FINAL_PR_READY.md"
  "FINAL_STATUS.md"
  "FIX_LOG.md"
  "GITHUB_SECRETS_CHECKLIST.md"
  "IMPLEMENTATION_COMPLETE.md"
  "IMPLEMENTATION_REPORT.md"
  "IMPLEMENTATION_SUMMARY.md"
  "LAUNCH_FIXES_COMPLETE.md"
  "LAUNCH_PRESSURE_AUDIT.md"
  "LAUNCH_READINESS_AUDIT.md"
  "LAUNCH_READINESS_FINAL.md"
  "LAUNCH_READINESS_REALITY_CHECK.md"
  "LAUNCH_READY_SUMMARY.md"
  "LAUNCH_ROADMAP.md"
  "LAUNCH_VERIFICATION_RUNBOOK.md"
  "PHASES_3_8_COMPLETE.md"
  "PHASE_0_FINDINGS.md"
  "PRODUCTION_READY.md"
  "PROOF.md"
  "REALITY_CHECK_FINAL.md"
  "REALITY_CHECK_REPORT.md"
  "REALITY_CHECK_SUMMARY.md"
  "REALITY_VERIFICATION_REPORT.md"
  "ROADMAP_DEPLOYMENT_STATUS.md"
  "ROADMAP_IMPLEMENTATION_COMPLETE.md"
  "SETUP_COMPLETE.md"
  "BACKEND_CONTRACT_VALIDATION_REPORT.md"
  "CI_CD_SETUP.md"
)

# Files to move to internal/audit/ (audits, reports, checks)
AUDIT_FILES=(
  "API_BASE_URL_EXPLANATION.md"
  "API_CONTRACT_CHECKLIST.md"
  "AUDIT_REPORT.md"
  "CATALOG.md"
  "ENV_VARS.md"
  "LINT_FIXES_SUMMARY.md"
  "REFACTOR_SUMMARY.md"
  "VERIFICATION_CHECKLIST.md"
  "SECURITY_AND_TRUST_MODEL.md"
  "STATUS.md"
)

# Function to move files safely
move_files() {
  local dest=$1
  shift
  local files=("$@")
  
  for file in "${files[@]}"; do
    if [ -f "$file" ]; then
      echo "Moving $file -> internal/$dest/"
      mv "$file" "internal/$dest/"
    fi
  done
}

echo "Organizing internal documentation..."

move_files "agent-notes" "${AGENT_FILES[@]}"
move_files "planning" "${PLANNING_FILES[@]}"
move_files "strategy" "${STRATEGY_FILES[@]}"
move_files "execution" "${EXECUTION_FILES[@]}"
move_files "audit" "${AUDIT_FILES[@]}"

echo "Done! Internal documentation organized."
echo ""
echo "To untrack these files from git (keeping local copies):"
echo "  git rm --cached internal/ -r"
echo ""
echo "Files kept in root (public):"
echo "  README.md, CONTRIBUTING.md, LICENSE, CHANGELOG.md (public facing)"

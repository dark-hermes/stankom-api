#!/bin/sh
# dev-entrypoint.sh
# - Skips prisma generation if a sentinel file or built client exists
# - Runs `pnpm prisma generate` when DATABASE_URL is set and no client exists
# - Generation failures are non-fatal (container continues to start)
# - Set DEV_ENTRYPOINT_VERBOSE=1 to enable debug logging

DEV_ENTRYPOINT_VERBOSE=${DEV_ENTRYPOINT_VERBOSE:-0}
FAIL_ON_PRISMA_GENERATE=${FAIL_ON_PRISMA_GENERATE:-0}

log() {
  if [ "${DEV_ENTRYPOINT_VERBOSE}" != "0" ]; then
    echo "[dev-entrypoint] $@"
  fi
}

info() { echo "[dev-entrypoint] $@"; }
warn() { echo "[dev-entrypoint] WARNING: $@" >&2; }

SENTINEL="/usr/src/app/.prisma_generated"
PRISMA_CLIENT_DIR="/usr/src/app/node_modules/.prisma/client"
# Path to a main generated client file to validate size/content
PRISMA_CLIENT_MAIN_FILE="/usr/src/app/node_modules/.prisma/client/index.js"

# Retry behavior for prisma generate (environment-configurable)
# DEV_ENTRYPOINT_RETRIES: number of attempts (default 3)
# DEV_ENTRYPOINT_BACKOFF: base backoff seconds (default 2)
DEV_ENTRYPOINT_RETRIES=${DEV_ENTRYPOINT_RETRIES:-3}
DEV_ENTRYPOINT_BACKOFF=${DEV_ENTRYPOINT_BACKOFF:-2}

info "starting entrypoint script"
log "DEV_ENTRYPOINT_VERBOSE=${DEV_ENTRYPOINT_VERBOSE}"

# Ensure we run from app dir so relative checks/imports work as expected
cd /usr/src/app || true

if [ -n "${DATABASE_URL}" ]; then
  # If the generated client is already present or sentinel exists, skip.
  if [ -d "${PRISMA_CLIENT_DIR}" ] || [ -f "${SENTINEL}" ]; then
    info "Prisma client already generated; skipping prisma generate"
    log "Found: ${PRISMA_CLIENT_DIR} exists = $( [ -d "${PRISMA_CLIENT_DIR}" ] && echo yes || echo no )"
    log "Found sentinel = $( [ -f "${SENTINEL}" ] && echo yes || echo no )"
  else
    info "DATABASE_URL detected — checking whether generation is required..."

    # Stronger check: ensure a main client file exists and has non-zero size
    if [ -f "${PRISMA_CLIENT_MAIN_FILE}" ] && [ -s "${PRISMA_CLIENT_MAIN_FILE}" ]; then
      info "Prisma client file found (${PRISMA_CLIENT_MAIN_FILE}) — skipping generation"
      touch "${SENTINEL}" 2>/dev/null || log "Could not create sentinel file (${SENTINEL})"
    else
      info "Prisma client not found or empty — attempting generation (retries=${DEV_ENTRYPOINT_RETRIES})"
      attempt=0
      success=0
      while [ $attempt -lt ${DEV_ENTRYPOINT_RETRIES} ]; do
        attempt=$((attempt+1))
        log "Attempt ${attempt} of ${DEV_ENTRYPOINT_RETRIES}: running 'pnpm prisma generate'"
        if pnpm prisma generate; then
          info "Prisma client generated successfully on attempt ${attempt}"
          # Post-generation checks: lightweight require vs full DB connect.
          if [ "${DEV_ENTRYPOINT_SMOKE_TEST}" = "1" ]; then
            log "Running full DB connect smoke-check (DEV_ENTRYPOINT_SMOKE_TEST=1)"
            # Try to connect using PrismaClient; exit non-zero on failure so we can retry
            if node -e "(async function(){ const {PrismaClient}=require('./node_modules/.prisma/client'); const c=new PrismaClient(); try{ await c.$connect(); await c.$disconnect(); console.log('ok'); } catch(e){ console.error(e); process.exit(1); } })()" 2>/dev/null; then
              info "Prisma client smoke-check (DB connect) passed"
              success=1
              touch "${SENTINEL}" 2>/dev/null || log "Could not create sentinel file (${SENTINEL})"
              break
            else
              warn "Prisma client smoke-check (DB connect) failed after generation on attempt ${attempt}"
            fi
          else
            # Lightweight require check (does not contact DB)
            if node -e "require('./node_modules/.prisma/client')" 2>/dev/null; then
              info "Prisma client import smoke-check passed (lightweight)"
              success=1
              touch "${SENTINEL}" 2>/dev/null || log "Could not create sentinel file (${SENTINEL})"
              break
            else
              warn "Prisma client import smoke-check failed after generation on attempt ${attempt}"
            fi
          fi
        else
          warn "pnpm prisma generate failed on attempt ${attempt}"
          if [ $attempt -lt ${DEV_ENTRYPOINT_RETRIES} ]; then
            backoff=$((DEV_ENTRYPOINT_BACKOFF * attempt))
            log "Sleeping ${backoff}s before next attempt"
            sleep ${backoff}
          fi
        fi
      done
      if [ ${success} -ne 1 ]; then
        msg="prisma generate failed after ${DEV_ENTRYPOINT_RETRIES} attempts or smoke-check failures"
        if [ "${FAIL_ON_PRISMA_GENERATE}" = "1" ]; then
          echo "[dev-entrypoint] ERROR: ${msg} and FAIL_ON_PRISMA_GENERATE=1 — exiting" >&2
          exit 1
        else
          warn "${msg} — continuing without generated client"
          log "You can run 'pnpm prisma generate' manually inside the container or on the host to retry."
        fi
      fi
    fi
  fi
else
  info "DATABASE_URL not set — skipping prisma generate"
fi

info "executing command: $@"
exec "$@"

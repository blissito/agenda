#!/bin/bash
# Prueba el webhook público de Denik: uno sin auth (debe dar 401), otro con Bearer (debe dar 200).
# Uso: ./test-webhook.sh <ORG_ID>
set -e

ORG_ID="${1:-TESTORGID}"
SECRET="Pelusina69@"
URL="https://www.denik.me/whatsapp/webhook"

echo "=== 1. Sin auth (esperado: 401) ==="
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -d "{\"jid\":\"webhook_denik_$ORG_ID\",\"text\":\"test sin auth\"}"

echo
echo "=== 2. Con Bearer (esperado: 200) ==="
curl -sS -w '\nHTTP %{http_code}\n' -X POST "$URL" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $SECRET" \
  -d "{\"jid\":\"webhook_denik_$ORG_ID\",\"text\":\"test desde test-webhook.sh\"}"

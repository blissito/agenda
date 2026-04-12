#!/bin/bash
# Reinicia nanoclaw.service.
ssh root@143.198.149.230 'systemctl restart nanoclaw && sleep 2 && systemctl is-active nanoclaw'

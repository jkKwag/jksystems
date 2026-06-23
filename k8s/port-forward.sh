#!/bin/bash
# Kubernetes port-forward 스크립트
# JMeter에서 localhost 호출 가능하도록 IPv4 명시 바인딩

SERVICE_NAME=${1:-"your-service-name"}
SERVICE_PORT=${2:-"8080"}
LOCAL_PORT=${3:-$SERVICE_PORT}
NAMESPACE=${4:-"default"}

echo "[INFO] Starting port-forward: localhost:$LOCAL_PORT -> $SERVICE_NAME:$SERVICE_PORT"

# 핵심: 127.0.0.1 명시 → IPv4만 바인딩 (localhost는 ::1로 갈 수 있음)
kubectl port-forward \
  -n "$NAMESPACE" \
  "svc/$SERVICE_NAME" \
  "127.0.0.1:$LOCAL_PORT:$SERVICE_PORT"

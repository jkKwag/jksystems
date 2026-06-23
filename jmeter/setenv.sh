#!/bin/bash
# JMeter 실행 전 환경 설정 스크립트
# K8s localhost(port-forward) 호출 시 IPv4 강제 적용

# IPv4 강제 - JMeter JVM 옵션
export JVM_ARGS="-Djava.net.preferIPv4Stack=true -Djava.net.preferIPv4Addresses=true"

echo "[INFO] JVM_ARGS set: $JVM_ARGS"
echo "[INFO] JMeter will use IPv4 for localhost connections"

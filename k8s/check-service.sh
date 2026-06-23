#!/bin/bash
# Spring Boot 서비스 이름 및 ClusterIP 확인
NAMESPACE=${1:-"default"}

echo "=== Kubernetes Services in namespace: $NAMESPACE ==="
kubectl get svc -n "$NAMESPACE" -o wide

echo ""
echo "=== JMeter에서 사용할 호출 주소 ==="
kubectl get svc -n "$NAMESPACE" --no-headers | while read name type clusterip externalip ports age; do
  port=$(echo "$ports" | cut -d'/' -f1 | cut -d':' -f1)
  echo "http://$name.$NAMESPACE.svc.cluster.local:$port"
done

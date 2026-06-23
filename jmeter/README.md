# JMeter + Kubernetes 호출 문제 해결

## 증상
- 로컬 PC에서 `curl http://localhost:8080/api` → 정상
- K8s Pod 안의 JMeter에서 `localhost:8080` 호출 → 404 / 연결 실패

## 원인

```
[로컬 PC]
  curl localhost:8080  →  kubectl port-forward 통해 Spring Boot 접근 ✅

[K8s 내 JMeter Pod]
  localhost:8080  →  JMeter Pod 자신의 loopback (Spring Boot 없음) ❌
```

Kubernetes에서 각 Pod은 독립적인 네트워크 네임스페이스를 가집니다.
`localhost`는 오직 해당 Pod 자신만 가리킵니다.

## 해결: Kubernetes Service 이름으로 호출

### JMeter HTTP Request 설정 변경

| 항목 | 기존 (잘못됨) | 수정 |
|------|-------------|------|
| Server Name | `localhost` | `spring-boot-service.default.svc.cluster.local` |
| Port | `8080` | `8080` (동일) |
| Path | `/api/...` | `/api/...` (동일) |

### Service 이름 확인 방법
```bash
# Spring Boot 서비스 이름 확인
kubectl get svc -n <namespace>

# JMeter에서 사용할 주소 형식
http://<서비스명>.<네임스페이스>.svc.cluster.local:<포트>

# 같은 네임스페이스라면 단축 가능
http://<서비스명>:<포트>
```

### 예시
```
Spring Boot Service 이름: api-server
네임스페이스: production
포트: 8080

→ JMeter Server Name: api-server.production.svc.cluster.local
→ 또는 같은 ns라면:  api-server
```

## JMeter 프로퍼티 파일로 관리 (권장)

`jmeter.properties` 또는 테스트 플랜 User Defined Variables에 설정:
```
TARGET_HOST=api-server.production.svc.cluster.local
TARGET_PORT=8080
```

HTTP Request에서 `${TARGET_HOST}`, `${TARGET_PORT}` 변수로 참조.

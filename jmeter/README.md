# JMeter + Kubernetes localhost 호출 문제 해결

## 증상
- `curl http://localhost:8080/api` → 정상
- JMeter HTTP Request (localhost:8080) → 연결 실패

## 원인

```
localhost 해석 차이:
  curl     → 127.0.0.1 (IPv4) ✅ K8s port-forward가 수신
  JMeter   → ::1       (IPv6) ❌ K8s port-forward가 수신 안 함
```

`kubectl port-forward`는 기본적으로 IPv4(`127.0.0.1`)에만 바인딩하지만,
JMeter JVM은 `localhost`를 IPv6(`::1`)로 먼저 시도합니다.

## 해결 방법 (3가지 중 택1)

### 방법 1: JMeter HTTP Request에서 IP 직접 사용 (가장 빠름)
- Server Name: `localhost` → `127.0.0.1` 로 변경

### 방법 2: JMeter JVM 옵션에 IPv4 강제 설정
```bash
# jmeter 실행 전
export JVM_ARGS="-Djava.net.preferIPv4Stack=true -Djava.net.preferIPv4Addresses=true"
./jmeter -t test-plan.jmx
```
또는 `jmeter/bin/jmeter` 스크립트 내 `HEAP` 변수 근처에 추가:
```
JVM_ARGS="-Djava.net.preferIPv4Stack=true"
```

### 방법 3: kubectl port-forward 시 127.0.0.1 명시
```bash
# 기존 (문제 있을 수 있음)
kubectl port-forward svc/my-service 8080:8080

# 수정 (IPv4 명시)
kubectl port-forward svc/my-service 127.0.0.1:8080:8080
```

## 권장 순서
1. JMeter에서 `localhost` → `127.0.0.1` 변경 (즉시 테스트 가능)
2. 안 되면 `JVM_ARGS` 설정 추가
3. port-forward도 `127.0.0.1:PORT:PORT` 형식으로 변경

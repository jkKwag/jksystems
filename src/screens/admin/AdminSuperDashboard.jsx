import { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { s } from "../../styles/admin/AdminSuperDashboard.styles";
import api from "../../lib/api";

const STATUS_COLOR_PALETTE = ["#22c55e", "#f59e0b", "#94a3b8", "#3b82f6", "#ef4444"];

export default function AdminSuperDashboard() {
  const [loaded, setLoaded] = useState(false);
  const [overview, setOverview] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [security, setSecurity] = useState(null);
  const [statusLabels, setStatusLabels] = useState({});
  const [industryLabels, setIndustryLabels] = useState({});

  const load = async () => {
    setLoaded(false);
    const [overviewRes, rankingRes, securityRes, statusCodes, industryList] = await Promise.all([
      api.dashboard.overview(),
      api.dashboard.revenueRanking(5),
      api.dashboard.security(),
      api.commonCode.list("OPR_STT_CD"),
      api.industry.list(),
    ]);
    setOverview(overviewRes);
    setRanking(Array.isArray(rankingRes) ? rankingRes : []);
    setSecurity(securityRes);

    const statusMap = {};
    (Array.isArray(statusCodes) ? statusCodes : []).forEach(c => { statusMap[c.cd] = c.cdNm; });
    setStatusLabels(statusMap);

    const indMap = {};
    (Array.isArray(industryList) ? industryList : []).forEach(d => { indMap[d.indCd] = d.indNm; });
    setIndustryLabels(indMap);

    setLoaded(true);
  };

  useEffect(() => { load(); }, []);

  if (!loaded) {
    return <ActivityIndicator style={{ marginTop: 60 }} color="#f97316" />;
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.headerRow}>
        <Text style={s.title}>전체 현황 대시보드</Text>
        <TouchableOpacity onPress={load}>
          <Text style={s.refreshBtnText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      <View style={s.statRow}>
        <View style={s.statTile}>
          <Text style={s.statLabel}>전체 가맹점</Text>
          <Text style={s.statValue}>{overview?.totalBizCount ?? 0}개</Text>
        </View>
      </View>

      <View style={s.twoColRow}>
        <View style={[s.card, s.halfCard]}>
          <Text style={s.cardTitle}>영업상태별 분포</Text>
          {(overview?.statusBreakdown || []).length === 0 ? (
            <Text style={s.emptySmallText}>데이터가 없습니다</Text>
          ) : (
            overview.statusBreakdown.map(({ code, count }, i) => (
              <View key={code} style={s.statusRow}>
                <View style={[s.statusDot, { backgroundColor: STATUS_COLOR_PALETTE[i % STATUS_COLOR_PALETTE.length] }]} />
                <Text style={s.statusLabel}>{statusLabels[code] || code}</Text>
                <Text style={s.statusCount}>{count}개</Text>
              </View>
            ))
          )}
        </View>

        <View style={[s.card, s.halfCard]}>
          <Text style={s.cardTitle}>업종별 분포</Text>
          {(overview?.industryBreakdown || []).length === 0 ? (
            <Text style={s.emptySmallText}>데이터가 없습니다</Text>
          ) : (
            overview.industryBreakdown.map(({ code, count }, i) => (
              <View key={code} style={s.statusRow}>
                <View style={[s.statusDot, { backgroundColor: STATUS_COLOR_PALETTE[i % STATUS_COLOR_PALETTE.length] }]} />
                <Text style={s.statusLabel}>{industryLabels[code] || code}</Text>
                <Text style={s.statusCount}>{count}개</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>사업장 매출 랭킹 TOP 5</Text>
        {ranking.length === 0 ? (
          <Text style={s.emptySmallText}>결제 데이터가 없습니다</Text>
        ) : (
          ranking.map((r, i) => (
            <View key={r.bizRegNo} style={[s.rankRow, i === 0 && s.rankRowFirst]}>
              <Text style={s.rankNo}>{i + 1}</Text>
              <View style={s.rankInfo}>
                <Text style={s.rankBizNm}>{r.bizNm}</Text>
                <Text style={s.rankMeta}>결제 {r.paymentCount}건</Text>
              </View>
              <Text style={s.rankAmount}>₩{Number(r.totalAmount || 0).toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>계정 / 보안 모니터링</Text>
        <Text style={s.secGroupLabel}>관리자 계정</Text>
        <View style={s.secGrid}>
          <View style={s.secTile}>
            <Text style={s.secLabel}>전체</Text>
            <Text style={s.secValue}>{security?.totalAdminCount ?? 0}명</Text>
          </View>
          <View style={s.secTile}>
            <Text style={s.secLabel}>최고관리자</Text>
            <Text style={s.secValue}>{security?.superAdminCount ?? 0}명</Text>
          </View>
          <View style={s.secTile}>
            <Text style={s.secLabel}>사업장관리자</Text>
            <Text style={s.secValue}>{security?.bizAdminCount ?? 0}명</Text>
          </View>
          <View style={[s.secTile, security?.inactiveAdminCount > 0 && s.secTileAlert]}>
            <Text style={s.secLabel}>비활성 계정</Text>
            <Text style={[s.secValue, security?.inactiveAdminCount > 0 && s.secValueAlert]}>{security?.inactiveAdminCount ?? 0}명</Text>
          </View>
        </View>

        <Text style={s.secGroupLabel}>직원 계정</Text>
        <View style={s.secGrid}>
          <View style={s.secTile}>
            <Text style={s.secLabel}>전체</Text>
            <Text style={s.secValue}>{security?.totalEmployeeCount ?? 0}명</Text>
          </View>
          <View style={s.secTile}>
            <Text style={s.secLabel}>재직중</Text>
            <Text style={s.secValue}>{security?.activeEmployeeCount ?? 0}명</Text>
          </View>
          <View style={s.secTile}>
            <Text style={s.secLabel}>퇴직</Text>
            <Text style={s.secValue}>{security?.inactiveEmployeeCount ?? 0}명</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

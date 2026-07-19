import { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, TouchableOpacity, Platform } from "react-native";
import { s } from "../../styles/admin/AdminBizQr.styles";
import api from "../../lib/api";

const MENU_BASE_URL = "https://www.jkscaneat.com/menu";

export default function AdminBizQr({ adminInfo }) {
  const bizRegNo = adminInfo?.bizRegNo;

  const [loaded, setLoaded] = useState(false);
  const [biz, setBiz] = useState(null);

  useEffect(() => {
    if (!bizRegNo) { setBiz(null); setLoaded(true); return; }
    setLoaded(false);
    (async () => {
      const data = await api.biz.get(bizRegNo);
      setBiz(data);
      setLoaded(true);
    })();
  }, [bizRegNo]);

  if (!bizRegNo) {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>상단에서 사업자등록번호로 사업장을 조회해주세요.</Text>
      </View>
    );
  }

  if (!loaded) {
    return <ActivityIndicator style={{ marginTop: 40 }} color="#f97316" />;
  }

  const targetUrl = `${MENU_BASE_URL}/${bizRegNo}`;
  const qrUri = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(targetUrl)}`;

  const downloadQr = async () => {
    if (Platform.OS !== "web") return;
    try {
      const res = await fetch(qrUri);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${bizRegNo}_qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(qrUri, "_blank");
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>사업장 QR관리</Text>

      <View style={s.infoBox}>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>사업장명</Text>
          <Text style={s.infoValue}>{biz?.bizNm || "-"}</Text>
        </View>
        <View style={s.infoRow}>
          <Text style={s.infoLabel}>사업자등록번호</Text>
          <Text style={s.infoValue}>{bizRegNo}</Text>
        </View>
      </View>

      <TouchableOpacity style={s.qrBox} onPress={downloadQr} activeOpacity={0.8}>
        <Image source={{ uri: qrUri }} style={s.qrImage} resizeMode="contain" />
      </TouchableOpacity>
      <Text style={s.hintText}>이미지를 클릭하면 저장돼요</Text>

      <Text style={s.urlText}>{targetUrl}</Text>
    </View>
  );
}

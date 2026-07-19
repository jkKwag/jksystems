import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import { s } from "../../styles/admin/TimeDialField.styles";

const HEADER_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

const HOUR_OUTER = Array.from({ length: 12 }, (_, i) => i);        // 00-11
const HOUR_INNER = Array.from({ length: 12 }, (_, i) => i + 12);   // 12-23
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);       // 00,05,...,55

const DIAL_SIZE = 220;
const CENTER = DIAL_SIZE / 2;
const OUTER_R = 86;
const INNER_R = 54;
const TICK_SIZE = 38;

const pad = (n) => String(n).padStart(2, "0");

const polar = (r, idx12) => {
  const angle = (idx12 * 30 - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
};

function Hand({ to }) {
  if (!to) return null;
  const dx = to.x - CENTER;
  const dy = to.y - CENTER;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const midX = (CENTER + to.x) / 2;
  const midY = (CENTER + to.y) / 2;
  return (
    <View
      style={[s.hand, { width: length, left: midX - length / 2, top: midY - 1, transform: [{ rotate: `${angle}deg` }] }]}
    />
  );
}

function Dial({ mode, hour, minute, onPickHour, onPickMinute }) {
  const items = mode === "hour"
    ? [...HOUR_OUTER.map(v => ({ v, r: OUTER_R })), ...HOUR_INNER.map(v => ({ v, r: INNER_R, inner: true }))]
    : MINUTES.map(v => ({ v, r: OUTER_R }));

  const selected = mode === "hour" ? hour : minute;
  const selectedItem = items.find(it => it.v === selected);
  const handTo = selectedItem ? polar(selectedItem.r, mode === "hour" ? (selectedItem.v % 12) : (selectedItem.v / 5) % 12) : null;

  return (
    <View style={s.dialWrap}>
      <View style={s.dial}>
        <View style={s.dialCenter} />
        <Hand to={handTo} />
        {items.map(({ v, r, inner }) => {
          const idx12 = mode === "hour" ? (v % 12) : (v / 5) % 12;
          const { x, y } = polar(r, idx12);
          const isSelected = v === selected;
          return (
            <TouchableOpacity
              key={v}
              style={[s.tick, { left: x - TICK_SIZE / 2, top: y - TICK_SIZE / 2 }, isSelected && s.tickSelected]}
              onPress={() => (mode === "hour" ? onPickHour(v) : onPickMinute(v))}
            >
              <Text style={[s.tickText, inner && s.tickTextInner, isSelected && s.tickTextSelected]}>{pad(v)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function TimeDialModal({ visible, label, initialValue, onConfirm, onClose }) {
  const [hour, setHour] = useState(null);
  const [minute, setMinute] = useState(null);
  const [mode, setMode] = useState("hour");

  useEffect(() => {
    if (!visible) return;
    if (initialValue) {
      const [h, m] = initialValue.split(":").map(Number);
      setHour(h);
      setMinute(Math.round(m / 5) * 5);
    } else {
      setHour(null);
      setMinute(null);
    }
    setMode("hour");
  }, [visible, initialValue]);

  if (!visible) return null;

  const pickHour = (v) => { setHour(v); setMode("minute"); if (minute == null) setMinute(0); };
  const pickMinute = (v) => setMinute(v);

  const confirm = () => {
    if (hour == null || minute == null) { onClose(); return; }
    onConfirm(`${pad(hour)}:${pad(minute)}`);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={onClose} />
        <View style={s.card}>
          <View style={[s.header, HEADER_GRADIENT]}>
            <Text style={s.headerLabel}>{label}</Text>
            <View style={s.headerDigits}>
              <TouchableOpacity onPress={() => setMode("hour")}>
                <Text style={[s.digit, mode === "hour" && s.digitActive]}>{hour != null ? pad(hour) : "--"}</Text>
              </TouchableOpacity>
              <Text style={s.digitColon}>:</Text>
              <TouchableOpacity onPress={() => setMode("minute")}>
                <Text style={[s.digit, mode === "minute" && s.digitActive]}>{minute != null ? pad(minute) : "--"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Dial mode={mode} hour={hour} minute={minute} onPickHour={pickHour} onPickMinute={pickMinute} />

          <View style={s.footer}>
            <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelBtnText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.confirmBtn} onPress={confirm}>
              <Text style={s.confirmBtnText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TimeField({ label, value, onChange, hideLabel }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={s.field}>
      {!hideLabel && <Text style={s.fieldLabel}>{label}</Text>}
      <TouchableOpacity style={s.trigger} onPress={() => setOpen(true)}>
        <Text style={[s.triggerText, !value && s.triggerPlaceholder]}>{value ? value.replace(":", " : ") : "-- : --"}</Text>
        <Text style={s.clockIcon}>🕐</Text>
      </TouchableOpacity>
      <TimeDialModal
        visible={open}
        label={label}
        initialValue={value}
        onConfirm={(v) => { onChange(v); setOpen(false); }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

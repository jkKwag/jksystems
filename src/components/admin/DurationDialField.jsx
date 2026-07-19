import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import { s } from "../../styles/admin/DurationDialField.styles";

const HEADER_GRADIENT = Platform.OS === "web"
  ? { background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)" }
  : {};

const DIAL_SIZE = 220;
const CENTER = DIAL_SIZE / 2;
const RING_R = 82;
const TICK_SIZE = 44;

const polar = (r, i, count) => {
  const angle = ((360 / count) * i - 90) * (Math.PI / 180);
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

function Dial({ options, unit, selected, onSelect }) {
  const selIdx = options.findIndex(v => v === selected);
  const handTo = selIdx >= 0 ? polar(RING_R, selIdx, options.length) : null;

  return (
    <View style={s.dialWrap}>
      <View style={s.dial}>
        <View style={s.dialCenter} />
        <Hand to={handTo} />
        {options.map((v, i) => {
          const { x, y } = polar(RING_R, i, options.length);
          const isSelected = v === selected;
          return (
            <TouchableOpacity
              key={v}
              style={[s.tick, { left: x - TICK_SIZE / 2, top: y - TICK_SIZE / 2 }, isSelected && s.tickSelected]}
              onPress={() => onSelect(v)}
            >
              <Text style={[s.tickText, isSelected && s.tickTextSelected]}>{v}</Text>
              <Text style={[s.tickUnit, isSelected && s.tickTextSelected]}>{unit}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function DurationDialModal({ visible, label, unit, options, initialValue, onConfirm, onClose }) {
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setValue(initialValue != null ? initialValue : null);
  }, [visible, initialValue]);

  if (!visible) return null;

  const confirm = () => {
    if (value == null) { onClose(); return; }
    onConfirm(value);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.overlayBg} activeOpacity={1} onPress={onClose} />
        <View style={s.card}>
          <View style={[s.header, HEADER_GRADIENT]}>
            <Text style={s.headerLabel}>{label}</Text>
            <Text style={s.headerValue}>{value != null ? `${value}${unit}` : `--${unit}`}</Text>
          </View>

          <Dial options={options} unit={unit} selected={value} onSelect={setValue} />

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

export default function DurationDialField({ label, value, onChange, options, unit = "분" }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={s.field}>
      <TouchableOpacity style={s.trigger} onPress={() => setOpen(true)}>
        <Text style={[s.triggerText, value == null && s.triggerPlaceholder]}>{value != null ? `${value}${unit}` : `-- ${unit}`}</Text>
        <Text style={s.clockIcon}>⏱️</Text>
      </TouchableOpacity>
      <DurationDialModal
        visible={open}
        label={label}
        unit={unit}
        options={options}
        initialValue={value}
        onConfirm={(v) => { onChange(v); setOpen(false); }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

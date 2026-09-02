import React from 'react';
import { Modal, View, Text, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react-native';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomAlert({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  showCancel = false,
  confirmText = 'OK',
  cancelText = 'Batal',
}: CustomAlertProps) {
  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={36} color="#10b981" />; // Emerald
      case 'error': return <XCircle size={36} color="#ef4444" />; // Red
      case 'warning': return <AlertTriangle size={36} color="#f59e0b" />; // Amber
      default: return <Info size={36} color="#3b82f6" />; // Blue
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success': return 'bg-emerald-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 justify-center items-center bg-black/50 px-5">
        <View className="bg-white w-full max-w-sm rounded-3xl p-6 items-center shadow-xl">
          <View className="mb-4">
            {getIcon()}
          </View>
          
          <Text className="text-xl font-extrabold text-slate-800 mb-2 text-center">
            {title}
          </Text>
          <Text className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
            {message}
          </Text>

          <View className={`flex-row w-full ${showCancel ? 'space-x-3' : ''}`}>
            {showCancel && (
              <TouchableOpacity 
                onPress={onCancel}
                className="flex-1 py-3.5 rounded-xl bg-slate-100 items-center justify-center border border-slate-200"
              >
                <Text className="font-bold text-slate-600">{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={onConfirm}
              className={`flex-1 py-3.5 rounded-xl items-center justify-center ${getButtonColor()}`}
            >
              <Text className="font-bold text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
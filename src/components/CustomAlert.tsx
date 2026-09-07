import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
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
      case 'success':
        return <CheckCircle2 size={36} color="#10b981" />;
      case 'error':
        return <XCircle size={36} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={36} color="#f59e0b" />;
      default:
        return <Info size={36} color="#3b82f6" />;
    }
  };

  const getButtonTextColor = () => {
    switch (type) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View className="flex-1 justify-center items-center bg-black/50 px-5">
        <View className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-xl">
          <View className="p-6 items-center">
            <View className="mb-4">{getIcon()}</View>
            <Text className="text-lg font-semibold text-slate-800 mb-2 text-center">
              {title}
            </Text>
            <Text className="text-sm text-slate-500 text-center leading-relaxed">
              {message}
            </Text>
          </View>

          <View className="border-t border-slate-200 flex-row">
            {showCancel && (
              <TouchableOpacity
                onPress={onCancel}
                activeOpacity={0.7}
                className="flex-1 py-3 items-center justify-center"
                style={{ borderRightWidth: 1, borderRightColor: '#e2e8f0' }}
              >
                <Text className="font-medium text-base text-slate-500">
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.7}
              className="flex-1 py-3 items-center justify-center"
            >
              <Text className={`font-semibold text-base ${getButtonTextColor()}`}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';
import { RENDERMEDIAURL } from '../../infrastructure/constants';

function buildQrPayload(qrValue) {
  const v = (qrValue || '').trim();
  if (!v) {
    const base = RENDERMEDIAURL.replace(/\/$/, '');
    return `${base}/jewellery`;
  }
  if (/^https?:\/\//i.test(v)) return v;
  const base = RENDERMEDIAURL.replace(/\/$/, '');
  return `${base}/jewellery?ref=${encodeURIComponent(v)}`;
}

const QRModal = ({ visible, onClose, qrValue, shopName }) => {
  const { t } = useTranslation();
  const payload = useMemo(() => buildQrPayload(qrValue), [qrValue]);

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(payload);
      Alert.alert(t('jw_copied'), t('jw_link_copied'));
    } catch {
      Alert.alert(t('error'), t('jw_copy_failed'));
    }
  };

  const handleShare = async () => {
    const message = shopName
      ? `${shopName}\n${payload}`
      : payload;
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message, url: payload }
          : { message }
      );
    } catch {
      Alert.alert(t('share'), t('jw_share_failed'));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('jw_share_qr')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={jewelleryColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.qrContainer}>
            <View style={styles.qrFrame}>
              <QRCode
                value={payload}
                size={200}
                backgroundColor={jewelleryColors.bgSecondary}
                color={jewelleryColors.text}
              />
            </View>
            {shopName ? <Text style={styles.shopName}>{shopName}</Text> : null}
            <Text style={styles.subtitle}>
              {t('jw_qr_hint')}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.downloadButton} onPress={handleCopyLink}>
              <Text style={styles.downloadButtonText}>{t('jw_copy_link')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Icon name="share" size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>{t('share')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: jewelleryColors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading3,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  qrFrame: {
    width: 200,
    height: 200,
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  shopName: {
    ...typography.heading2,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  downloadButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    alignItems: 'center',
  },
  downloadButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: jewelleryColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  shareButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default QRModal;

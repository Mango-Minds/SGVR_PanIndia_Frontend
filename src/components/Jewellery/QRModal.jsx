import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';
// Note: You'll need to install react-native-qrcode-svg or similar for QR code generation
// For now, using a placeholder

const QRModal = ({ visible, onClose, qrValue, shopName, onDownload, onShare }) => {
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
            <Text style={styles.title}>Share QR Code</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={jewelleryColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.qrContainer}>
            {/* Placeholder for QR Code - Replace with actual QR code component */}
            <View style={styles.qrPlaceholder}>
              <Icon name="qr-code-2" size={120} color={jewelleryColors.text} />
            </View>
            <Text style={styles.shopName}>{shopName}</Text>
            <Text style={styles.subtitle}>Share this QR Code to View Shop Details</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
              <Text style={styles.downloadButtonText}>Download QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={onShare}>
              <Icon name="share" size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share QR</Text>
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
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
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



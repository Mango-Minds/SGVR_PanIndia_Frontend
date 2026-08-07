import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { jewelleryColors, typography, spacing } from '../../styles/jewellery.styles';

const ReviewForm = ({ visible, onClose, onSubmit, isLoading = false }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleStarPress = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert(t('jw_rating_required'), t('jw_select_rating'));
      return;
    }

    onSubmit(rating, comment);
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={star <= rating ? 'star' : 'star-border'}
              size={40}
              color={star <= rating ? jewelleryColors.primary : jewelleryColors.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('jw_write_a_review')}</Text>
              <TouchableOpacity onPress={handleClose} disabled={isLoading}>
                <Icon name="close" size={24} color={jewelleryColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.content}>
                <Text style={styles.label}>{t('jw_rating_label')}</Text>
                {renderStars()}
                {rating > 0 && (
                  <Text style={styles.ratingText}>
                    {rating} {rating === 1 ? t('jw_star') : t('jw_stars')}
                  </Text>
                )}

                <View style={styles.commentSection}>
                  <Text style={styles.label}>{t('jw_comment_optional')}</Text>
                  <TextInput
                    style={styles.commentInput}
                    placeholder={t('jw_share_experience')}
                    placeholderTextColor={jewelleryColors.textSecondary}
                    value={comment}
                    onChangeText={setComment}
                    multiline
                    numberOfLines={5}
                    maxLength={1000}
                    editable={!isLoading}
                  />
                  <Text style={styles.charCount}>
                    {comment.length}{t('jw_char_count', { count: 1000 })}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelButton, isLoading && styles.buttonDisabled]}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (rating === 0 || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={rating === 0 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>{t('jw_submit_review')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    maxHeight: '80%',
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
  content: {
    paddingVertical: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: jewelleryColors.text,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ratingText: {
    ...typography.bodySmall,
    textAlign: 'center',
    color: jewelleryColors.textSecondary,
    marginTop: spacing.xs,
  },
  commentSection: {
    marginTop: spacing.xl,
  },
  commentInput: {
    ...typography.body,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: jewelleryColors.bgSecondary,
    color: jewelleryColors.text,
  },
  charCount: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
    color: jewelleryColors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: jewelleryColors.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: jewelleryColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ReviewForm;

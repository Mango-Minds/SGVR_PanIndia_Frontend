import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeArea } from '../components/utility/safe-area.component';
import { MainContainer } from '../styles/prelogin.styles';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { deleteAccountHandler, ErrorToggle } from '../store/user';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Theme from '../styles/theme';
import axios from 'axios';
import { BASEAPIURL } from '../infrastructure/constants';
import authHeader from '../services/auth.header';

const { width } = Dimensions.get('window');

export default function DeleteAccountScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      t('delete_account_confirmation_title'),
      t('delete_account_confirmation_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete_permanently'),
          style: 'destructive',
          onPress: () => performAccountDeletion()
        }
      ]
    );
  };

  const performAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      const res = await axios.post(
        `${BASEAPIURL}/auth/delete-user`,
        {
          password: '', // Password will be handled by backend verification
        },
        {
          headers: await authHeader(),
        }
      );

      if (res.data.success) {
        dispatch(deleteAccountHandler());
      } else {
        dispatch(ErrorToggle({
          toggle: true,
          msg: res.data.message || 'Failed to delete account',
          type: 'error'
        }));
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      dispatch(ErrorToggle({
        toggle: true,
        msg: 'Error deleting account. Please try again.',
        type: 'error'
      }));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeArea>
      <MainContainer>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>{t('delete_account')}</Text>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.warningSection}>
            <Text style={styles.warningTitle}>⚠️ {t('warning')}</Text>
            <Text style={styles.warningText}>
              {t('delete_account_warning')}
            </Text>
          </View>

          <View style={styles.dataSection}>
            <Text style={styles.sectionTitle}>{t('data_that_will_be_deleted')}</Text>
            <View style={styles.dataList}>
              <Text style={styles.dataItem}>• {t('profile_information')}</Text>
              <Text style={styles.dataItem}>• {t('posts_and_comments')}</Text>
              <Text style={styles.dataItem}>• {t('chat_history')}</Text>
              <Text style={styles.dataItem}>• {t('matrimony_profile')}</Text>
              <Text style={styles.dataItem}>• {t('temple_connections')}</Text>
              <Text style={styles.dataItem}>• {t('b2c_listings')}</Text>
              <Text style={styles.dataItem}>• {t('notifications')}</Text>
              <Text style={styles.dataItem}>• {t('uploaded_media')}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>ℹ️ {t('important_note')}</Text>
            <Text style={styles.infoText}>
              {t('deletion_permanent_note')}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <Text style={styles.deleteButtonText}>
              {isDeleting ? t('deleting_account') : t('delete_my_account')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </MainContainer>
    </SafeArea>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.themeColor,
    marginLeft: 8,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  warningSection: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  dataSection: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  dataList: {
    marginLeft: 8,
  },
  dataItem: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 6,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#E7F3FF',
    borderColor: '#B3D9FF',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C5460',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0C5460',
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    width: width * 0.9,
    alignSelf: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#6C757D',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: width * 0.9,
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '500',
  },
});

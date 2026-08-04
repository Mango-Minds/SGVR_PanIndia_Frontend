import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { setLoadingInBtn } from '../../store/user';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';
import { BASEAPIURL, BASEIMGURL } from '../../infrastructure/constants';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import { createShopEvent } from '../../services/jewellery.services';
import FormData from 'form-data';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ShopEventCreate = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { shopId, date } = route.params || {};
  const token = useSelector((state) => state.user.token);
  const { loadingInBtn } = useSelector((state) => state.user);

  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(date ? moment(date).toDate() : new Date());
  const [times, setTimes] = useState([]);
  const [time, setTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerImageUri, setBannerImageUri] = useState(null);
  const [address, setAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const formatTime = (date) => {
    return moment(date).format('HH:mm');
  };

  const onDayPress = (day) => {
    setSelectedDate(moment(day.dateString).toDate());
    setShowCalendarModal(false);
  };

  const openTimePicker = () => {
    setTime(new Date());
    setShowTimePicker(true);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (event.type !== 'dismissed' && selectedTime) {
      setTime(selectedTime);
      setTimes((prev) => [...prev, selectedTime]);
    }
  };

  const removeTime = (index) => {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const pickBannerImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setBannerImageUri(result.assets[0].uri);
        setBannerImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadBannerImage = async () => {
    if (!bannerImage) return null;

    try {
      const formData = new FormData();
      const filename = bannerImage.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri: bannerImage.uri,
        name: filename,
        type,
      });

      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${BASEAPIURL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.filePath || data.uri;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload banner image');
      return null;
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!eventName.trim()) {
      Alert.alert('Validation Error', 'Please enter an event name');
      return;
    }
    if (!eventDescription.trim()) {
      Alert.alert('Validation Error', 'Please enter an event description');
      return;
    }
    if (!selectedDate) {
      Alert.alert('Validation Error', 'Please select an event date');
      return;
    }
    if (times.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one event time');
      return;
    }

    try {
      dispatch(setLoadingInBtn(true));

      // Upload banner image if selected
      let bannerImagePath = '';
      if (bannerImage) {
        bannerImagePath = await uploadBannerImage();
        if (!bannerImagePath) {
          dispatch(setLoadingInBtn(false));
          return;
        }
      }

      const eventDate = selectedDate
        ? `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`
        : '';

      const eventTime = times.map((time) => formatTime(time));

      const eventData = {
        eventName,
        eventDate,
        eventDescription,
        shop: shopId,
        eventTime,
        bannerImage: bannerImagePath,
        address: address || '',
        contactPhone: contactPhone || '',
        contactEmail: contactEmail || '',
      };

      await createShopEvent(eventData);

      dispatch(setLoadingInBtn(false));

      Alert.alert(
        'Success',
        'Event created successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      dispatch(setLoadingInBtn(false));
      console.error('Error creating event:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create event';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title={t('jw_create_event')} onBackPress={handleBackPress} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Event Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Event Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter event name"
                value={eventName}
                onChangeText={setEventName}
                placeholderTextColor={jewelleryColors.textSecondary}
              />
            </View>

            {/* Event Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Event Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter event description"
                value={eventDescription}
                onChangeText={setEventDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={jewelleryColors.textSecondary}
              />
            </View>

            {/* Event Date */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Event Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCalendarModal(true)}
              >
                <Icon name="calendar-today" size={20} color={jewelleryColors.primary} />
                <Text style={styles.dateButtonText}>
                  {selectedDate ? moment(selectedDate).format('DD/MM/YYYY') : 'Select Date'}
                </Text>
                <Icon name="chevron-right" size={20} color={jewelleryColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Calendar Modal */}
            <Modal
              visible={showCalendarModal}
              animationType="fade"
              transparent={true}
              onRequestClose={() => setShowCalendarModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Date</Text>
                    <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                      <Icon name="close" size={24} color={jewelleryColors.text} />
                    </TouchableOpacity>
                  </View>
                  <Calendar
                    onDayPress={onDayPress}
                    markedDates={{
                      [moment(selectedDate).format('YYYY-MM-DD')]: {
                        selected: true,
                        selectedColor: jewelleryColors.primary,
                        selectedTextColor: 'white',
                      },
                    }}
                    minDate={moment().format('YYYY-MM-DD')}
                    theme={{
                      selectedDayBackgroundColor: jewelleryColors.primary,
                      selectedDayTextColor: 'white',
                      todayTextColor: jewelleryColors.primary,
                      dayTextColor: '#333',
                      textDisabledColor: '#ccc',
                      arrowColor: jewelleryColors.primary,
                      monthTextColor: '#333',
                    }}
                  />
                </View>
              </View>
            </Modal>

            {/* Event Times */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('jw_event_times')} *</Text>
              <TouchableOpacity style={styles.timeButton} onPress={openTimePicker}>
                <Icon name="access-time" size={20} color={jewelleryColors.primary} />
                <Text style={styles.timeButtonText}>{t('jw_add_event_time')}</Text>
                <Icon name="add" size={20} color={jewelleryColors.primary} />
              </TouchableOpacity>

              {times.length > 0 && (
                <View style={styles.timeSlotContainer}>
                  {times.map((time, index) => (
                    <View key={index} style={styles.timeSlot}>
                      <Text style={styles.timeSlotText}>{formatTime(time)}</Text>
                      <TouchableOpacity
                        onPress={() => removeTime(index)}
                        style={styles.removeTimeButton}
                      >
                        <Icon name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={time || new Date()}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}
            </View>

            {/* Banner Image */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Banner Image</Text>
              <TouchableOpacity style={styles.imageButton} onPress={pickBannerImage}>
                {bannerImageUri ? (
                  <Image source={{ uri: bannerImageUri }} style={styles.bannerImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="image" size={40} color={jewelleryColors.textSecondary} />
                    <Text style={styles.imagePlaceholderText}>Tap to add banner image</Text>
                  </View>
                )}
              </TouchableOpacity>
              {bannerImageUri && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setBannerImageUri(null);
                    setBannerImage(null);
                  }}
                >
                  <Icon name="delete" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter event address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={jewelleryColors.textSecondary}
              />
            </View>

            {/* Contact Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter contact phone number"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                placeholderTextColor={jewelleryColors.textSecondary}
              />
            </View>

            {/* Contact Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter contact email"
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={jewelleryColors.textSecondary}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loadingInBtn && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loadingInBtn}
            >
              {loadingInBtn ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Create Event</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: jewelleryColors.text,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: jewelleryColors.bg,
    color: jewelleryColors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: jewelleryColors.bg,
    gap: spacing.sm,
  },
  dateButtonText: {
    ...typography.body,
    flex: 1,
    color: jewelleryColors.text,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: jewelleryColors.bg,
    gap: spacing.sm,
  },
  timeButtonText: {
    ...typography.body,
    flex: 1,
    color: jewelleryColors.text,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: jewelleryColors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  timeSlotText: {
    ...typography.bodySmall,
    color: 'white',
    fontWeight: '600',
  },
  removeTimeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButton: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: jewelleryColors.border,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
  },
  imagePlaceholderText: {
    ...typography.bodySmall,
    color: jewelleryColors.textSecondary,
    marginTop: spacing.sm,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: jewelleryColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...typography.body,
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.heading3,
    fontWeight: '600',
  },
});

export default ShopEventCreate;


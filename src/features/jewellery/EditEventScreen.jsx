import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import HeaderBar from '../../components/Jewellery/HeaderBar';
import {
  getJewelleryEventById,
  updateJewelleryEvent,
} from '../../services/jewellery.services';
import { normalizeEvent } from '../../models/events';
import { setLoadingInBtn } from '../../store/user';
import { jewelleryColors, typography, spacing, commonStyles } from '../../styles/jewellery.styles';

const EVENT_CATEGORIES = ['Showcase', 'Exhibition', 'Workshop', 'Seminar', 'Festival'];
const MAX_EVENT_IMAGES = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePhone = (value) =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(-10);

const EditEventScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { eventId } = route.params || {};
  const { loadingInBtn } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [newBannerImage, setNewBannerImage] = useState(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState('');
  const [existingGalleryUrls, setExistingGalleryUrls] = useState([]);
  const [newEventImages, setNewEventImages] = useState([]);
  const [calendarField, setCalendarField] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Showcase',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    address: '',
    organizer: '',
    organizerPhone: '',
    organizerEmail: '',
    entryFee: '',
    capacity: '',
    isVerified: false,
    isFeatured: false,
  });

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getJewelleryEventById(eventId);
        const event = normalizeEvent(data);

        setForm({
          name: event.name,
          description: event.description,
          category: event.category || 'Showcase',
          startDate: event.startDate,
          endDate: event.endDate,
          startTime: event.startTime,
          endTime: event.endTime,
          venue: event.venue,
          address: event.address,
          organizer: event.organizer,
          organizerPhone: normalizePhone(event.organizerPhone),
          organizerEmail: event.organizerEmail,
          entryFee: event.entryFee,
          capacity: String(event.capacity || '').replace(/\D/g, ''),
          isVerified: event.isVerified,
          isFeatured: event.isFeatured,
        });
        setExistingBannerUrl(event.bannerImage || '');
        setExistingGalleryUrls(event.images || []);
      } catch (error) {
        Alert.alert('Error', 'Failed to load event details.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId, navigation]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const formatDisplayDate = (ymd) =>
    ymd ? moment(ymd, 'YYYY-MM-DD').format('DD/MM/YYYY') : '';

  const onDayPress = (day) => {
    setForm((prev) => {
      const next = { ...prev, [calendarField]: day.dateString };
      if (
        calendarField === 'startDate' &&
        prev.endDate &&
        day.dateString > prev.endDate
      ) {
        next.endDate = day.dateString;
      }
      return next;
    });
    setCalendarField(null);
  };

  const pickBannerImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setNewBannerImage(result.assets[0]);
      setExistingBannerUrl('');
    }
  };

  const pickEventImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setNewEventImages((prev) => [...prev, result.assets[0]]);
    }
  };

  const removeBannerImage = () => {
    setNewBannerImage(null);
    setExistingBannerUrl('');
  };

  const removeExistingGalleryImage = (index) => {
    setExistingGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewEventImage = (index) => {
    setNewEventImages((prev) => prev.filter((_, i) => i !== index));
  };

  const appendImageToFormData = (formData, fieldName, asset, index = 0) => {
    const filename = asset.uri.split('/').pop() || `${fieldName}-${index}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append(fieldName, {
      uri: asset.uri,
      name: filename,
      type,
    });
  };

  const bannerPreview = newBannerImage?.uri || existingBannerUrl;
  const totalGalleryCount = existingGalleryUrls.length + newEventImages.length;

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter event name.');
      return;
    }
    if (!form.description.trim()) {
      Alert.alert('Required', 'Please enter event description.');
      return;
    }
    if (!form.startDate.trim()) {
      Alert.alert('Required', 'Please select start date.');
      return;
    }
    if (form.endDate.trim() && form.endDate < form.startDate) {
      Alert.alert('Invalid', 'End date cannot be before start date.');
      return;
    }
    if (!form.venue.trim()) {
      Alert.alert('Required', 'Please enter venue.');
      return;
    }
    if (!form.organizer.trim()) {
      Alert.alert('Required', 'Please enter organizer name.');
      return;
    }
    if (!form.organizerPhone.trim()) {
      Alert.alert('Required', 'Please enter organizer phone number.');
      return;
    }
    if (!/^\d{10}$/.test(form.organizerPhone.trim())) {
      Alert.alert('Invalid', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!form.organizerEmail.trim()) {
      Alert.alert('Required', 'Please enter organizer email.');
      return;
    }
    if (!EMAIL_REGEX.test(form.organizerEmail.trim())) {
      Alert.alert('Invalid', 'Please enter a valid email address.');
      return;
    }
    if (
      form.capacity.trim() &&
      (!/^\d+$/.test(form.capacity.trim()) || parseInt(form.capacity, 10) < 0)
    ) {
      Alert.alert('Invalid', 'Please enter a valid capacity.');
      return;
    }
    if (!bannerPreview && totalGalleryCount === 0) {
      Alert.alert('Required', 'Please keep at least one event image.');
      return;
    }

    const capacity = parseInt(form.capacity, 10) || 0;

    try {
      dispatch(setLoadingInBtn(true));

      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('category', form.category);
      formData.append('startDate', form.startDate.trim());
      formData.append('endDate', form.endDate.trim() || form.startDate.trim());
      formData.append('startTime', form.startTime.trim());
      formData.append('endTime', form.endTime.trim());
      formData.append('venue', form.venue.trim());
      formData.append('address', form.address.trim());
      formData.append('organizer', form.organizer.trim());
      formData.append('organizerPhone', form.organizerPhone.trim());
      formData.append('organizerEmail', form.organizerEmail.trim());
      formData.append('entryFee', form.entryFee.trim() || 'Free');
      formData.append('capacity', String(capacity));
      formData.append('isVerified', String(form.isVerified));
      formData.append('isFeatured', String(form.isFeatured));
      formData.append('existingBannerImage', existingBannerUrl || '');
      formData.append('existingImages', JSON.stringify(existingGalleryUrls));

      if (newBannerImage) {
        appendImageToFormData(formData, 'bannerImage', newBannerImage);
      }

      newEventImages.forEach((image, index) => {
        appendImageToFormData(formData, 'images', image, index);
      });

      await updateJewelleryEvent(eventId, formData);

      dispatch(setLoadingInBtn(false));

      Alert.alert('Success', 'Event updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      dispatch(setLoadingInBtn(false));
      const message =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.message ||
        'Failed to update event';
      Alert.alert('Error', message);
    }
  };

  const renderInput = (label, field, options = {}) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, options.multiline && styles.textArea]}
        value={form[field]}
        onChangeText={(value) => {
          if (options.digitsOnly) {
            updateField(field, value.replace(/\D/g, '').slice(0, options.maxLength || 10));
            return;
          }
          updateField(field, value);
        }}
        placeholder={options.placeholder || ''}
        placeholderTextColor={jewelleryColors.textSecondary}
        multiline={options.multiline}
        numberOfLines={options.multiline ? 4 : 1}
        keyboardType={options.keyboardType || 'default'}
        autoCapitalize={options.autoCapitalize || 'sentences'}
        maxLength={options.maxLength}
      />
    </View>
  );

  const renderDateField = (label, field) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setCalendarField(field)}>
        <Icon name="calendar-today" size={20} color={jewelleryColors.primary} />
        <Text
          style={[
            styles.dateButtonText,
            !form[field] && styles.placeholderText,
          ]}
        >
          {form[field] ? formatDisplayDate(form[field]) : 'Select date'}
        </Text>
        <Icon name="chevron-right" size={20} color={jewelleryColors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const selectedCalendarDate =
    (calendarField && form[calendarField]) ||
    form.startDate ||
    moment().format('YYYY-MM-DD');

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container} edges={['top']}>
        <HeaderBar showBack title="Edit Event" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={jewelleryColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={['top']}>
      <HeaderBar showBack title="Edit Event" onBackPress={handleBackPress} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banner Image</Text>
            <View style={styles.imageRow}>
              {bannerPreview ? (
                <View style={styles.bannerWrapper}>
                  <Image source={{ uri: bannerPreview }} style={styles.bannerImage} />
                  <TouchableOpacity style={styles.removeButton} onPress={removeBannerImage}>
                    <Icon name="close" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.addBannerButton} onPress={pickBannerImage}>
                  <Icon name="add-photo-alternate" size={32} color={jewelleryColors.primary} />
                  <Text style={styles.addImageText}>Add Banner</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Event Images</Text>
            <View style={styles.imageRow}>
              {existingGalleryUrls.map((uri, index) => (
                <View key={`existing-${index}`} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeExistingGalleryImage(index)}
                  >
                    <Icon name="close" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {newEventImages.map((image, index) => (
                <View key={`new-${index}`} style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeNewEventImage(index)}
                  >
                    <Icon name="close" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
              {totalGalleryCount < MAX_EVENT_IMAGES && (
                <TouchableOpacity style={styles.addImageButton} onPress={pickEventImage}>
                  <Icon name="add" size={28} color={jewelleryColors.primary} />
                  <Text style={styles.addImageText}>Add Image</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {renderInput('Event Name *', 'name', { placeholder: 'Enter event name' })}
          {renderInput('Description *', 'description', {
            placeholder: 'Describe the event',
            multiline: true,
          })}

          <View style={styles.field}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryRow}>
              {EVENT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    form.category === category && styles.categoryChipActive,
                  ]}
                  onPress={() => updateField('category', category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      form.category === category && styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {renderDateField('Start Date *', 'startDate')}
          {renderDateField('End Date', 'endDate')}
          {renderInput('Start Time', 'startTime', { placeholder: 'e.g. 10:00 AM' })}
          {renderInput('End Time', 'endTime', { placeholder: 'e.g. 06:00 PM' })}
          {renderInput('Venue *', 'venue', { placeholder: 'Event venue name' })}
          {renderInput('Address', 'address', {
            placeholder: 'Full address',
            multiline: true,
          })}
          {renderInput('Organizer *', 'organizer', { placeholder: 'Organizer name' })}
          {renderInput('Organizer Phone *', 'organizerPhone', {
            placeholder: '10-digit mobile number',
            keyboardType: 'phone-pad',
            maxLength: 10,
            digitsOnly: true,
          })}
          {renderInput('Organizer Email *', 'organizerEmail', {
            placeholder: 'email@example.com',
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          })}
          {renderInput('Entry Fee', 'entryFee', { placeholder: 'Free or amount' })}
          {renderInput('Capacity', 'capacity', {
            placeholder: 'Maximum attendees',
            keyboardType: 'numeric',
            maxLength: 6,
            digitsOnly: true,
          })}

          <View style={styles.switchRow}>
            <Text style={styles.label}>Verified Event</Text>
            <Switch
              value={form.isVerified}
              onValueChange={(value) => updateField('isVerified', value)}
              trackColor={{ false: jewelleryColors.border, true: jewelleryColors.primary }}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Featured Event</Text>
            <Switch
              value={form.isFeatured}
              onValueChange={(value) => updateField('isFeatured', value)}
              trackColor={{ false: jewelleryColors.border, true: jewelleryColors.primary }}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loadingInBtn && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loadingInBtn}
          >
            {loadingInBtn ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={!!calendarField}
        animationType="fade"
        transparent
        onRequestClose={() => setCalendarField(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {calendarField === 'endDate' ? 'Select End Date' : 'Select Start Date'}
              </Text>
              <TouchableOpacity onPress={() => setCalendarField(null)}>
                <Icon name="close" size={24} color={jewelleryColors.text} />
              </TouchableOpacity>
            </View>
            <Calendar
              onDayPress={onDayPress}
              markedDates={{
                [selectedCalendarDate]: {
                  selected: true,
                  selectedColor: jewelleryColors.primary,
                  selectedTextColor: 'white',
                },
              }}
              minDate={
                calendarField === 'endDate' && form.startDate
                  ? form.startDate
                  : undefined
              }
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

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    ...typography.heading3,
    fontSize: 18,
    fontWeight: '700',
    color: jewelleryColors.text,
    marginBottom: spacing.xs,
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  bannerWrapper: {
    position: 'relative',
    width: '100%',
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addBannerButton: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: jewelleryColors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: jewelleryColors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
  },
  addImageText: {
    ...typography.bodySmall,
    color: jewelleryColors.primary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  field: { marginBottom: spacing.md },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: jewelleryColors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: jewelleryColors.text,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: jewelleryColors.bgSecondary,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
    gap: spacing.sm,
  },
  dateButtonText: {
    ...typography.body,
    flex: 1,
    color: jewelleryColors.text,
  },
  placeholderText: {
    color: jewelleryColors.textSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: jewelleryColors.bgSecondary,
    borderWidth: 1,
    borderColor: jewelleryColors.border,
  },
  categoryChipActive: {
    backgroundColor: jewelleryColors.primary,
    borderColor: jewelleryColors.primary,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: jewelleryColors.text,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  submitButton: {
    backgroundColor: jewelleryColors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 16,
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
    color: jewelleryColors.text,
  },
});

export default EditEventScreen;

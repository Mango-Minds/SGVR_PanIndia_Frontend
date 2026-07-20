import { BASEIMGURL } from "../infrastructure/constants";

export const createEventData = (eventId) => ({
  id: eventId || "",
  name: "",
  description: "",
  category: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  venue: "",
  address: "",
  organizer: "",
  organizerPhone: "",
  organizerEmail: "",
  bannerImage: "",
  images: [],
  entryFee: "",
  capacity: 0,
  registeredCount: 0,
  interestedCount: 0,
  interestedUsers: [],
  isVerified: false,
  isFeatured: false,
  createdBy: "",
  createdAt: null,
  updatedAt: null,
});

export const resolveImageUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("file://")
  ) {
    return url;
  }
  return `${BASEIMGURL}${url.replace(/^\//, "")}`;
};

const formatDateValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().split("T")[0];
};

export const normalizeEvent = (event) => {
  if (!event) return createEventData();

  return {
    id: event._id || event.id || "",
    name: event.name || "",
    description: event.description || "",
    category: event.category || "",
    startDate: formatDateValue(event.startDate),
    endDate: formatDateValue(event.endDate),
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    venue: event.venue || "",
    address: event.address || "",
    organizer: event.organizer || "",
    organizerPhone: event.organizerPhone || "",
    organizerEmail: event.organizerEmail || "",
    bannerImage: resolveImageUrl(event.bannerImage),
    images: Array.isArray(event.images)
      ? event.images.map(resolveImageUrl).filter(Boolean)
      : [],
    entryFee: event.entryFee || "Free",
    capacity: event.capacity || 0,
    registeredCount: event.registeredCount || 0,
    interestedCount: event.interestedCount || 0,
    interestedUsers: Array.isArray(event.interestedUsers)
      ? event.interestedUsers.map((id) => String(id?._id || id))
      : [],
    isVerified: Boolean(event.isVerified),
    isFeatured: Boolean(event.isFeatured),
    createdBy: String(event.createdBy?._id || event.createdBy || ""),
    createdAt: event.createdAt || null,
    updatedAt: event.updatedAt || null,
  };
};

export const formatEventDate = (startDate, endDate) => {
  if (!startDate) return "";
  if (!endDate || startDate === endDate) return startDate;
  return `${startDate} - ${endDate}`;
};

export const formatEventTime = (startTime, endTime) => {
  if (!startTime) return "";
  if (!endTime) return startTime;
  return `${startTime} - ${endTime}`;
};

export const getEventImages = (event) => {
  const images = [];
  if (event?.bannerImage) images.push(resolveImageUrl(event.bannerImage));
  if (Array.isArray(event?.images)) {
    event.images.forEach((img) => {
      const resolved = resolveImageUrl(img);
      if (resolved && !images.includes(resolved)) images.push(resolved);
    });
  }
  return images;
};

// Formatting Utilities

// Format Currency (XAF - Central African CFA franc)
export const formatCurrency = (amount: number, currency: string = 'XAF'): string => {
  if (currency === 'XAF') {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  }
  return `${currency} ${amount.toLocaleString()}`;
};

// Format Distance
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// Format Phone Number (International format)
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Cameroon phone numbers: +237 XXX XXX XXX
  if (cleaned.startsWith('237')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  return phone;
};

// Truncate Text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

// Capitalize First Letter
export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Format Rating (e.g., "4.5 ★")
export const formatRating = (rating: number): string => {
  return `${rating.toFixed(1)} ★`;
};

// Format Percentage
export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

// Format Device IP for Display
export const formatDeviceIP = (ip: string): string => {
  // Mask part of IP for privacy: 192.168.*.***
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return ip;
};

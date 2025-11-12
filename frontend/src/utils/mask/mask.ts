export const maskEmail = (email: string) => {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  const visible = name.slice(0, 2);
  return `${visible}****@${domain}`;
};

export const maskPhone = (phone: string) => {
  if (!phone) return "";
  return phone.slice(0, 2) + "****" + phone.slice(-2);
};

export const isValidPhone = (phone: string): boolean => {
  // Bắt đầu bằng 0, dài 10-11 số, chỉ chứa số
  const regex = /^(0\d{9,10})$/;
  return regex.test(phone);
};

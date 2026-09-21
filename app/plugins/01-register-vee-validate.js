import { defineRule } from "vee-validate";
import {
  confirmed as confirmedRule,
  email as emailRule,
  min as minRule,
  min_value as minValueRule,
  max_value as maxValueRule,
  numeric as numericRule,
  alpha as alphaRule,
  between as betweenRule,
} from "@vee-validate/rules";

/** Map form field names → Arabic labels for validation messages */
const FIELD_LABELS = {
  name: "الاسم",
  fullName: "الاسم الكامل",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  phone: "رقم الهاتف",
  role: "الدور",
  branchId: "الفرع",
  status: "الحالة",
  type: "نوع المنتج",
  studyYearId: "السنة الدراسية",
  teacherId: "المدرس",
  purchasePrice: "سعر الشراء",
  sellingPrice: "سعر البيع",
  lowStockThreshold: "حد تنبيه المخزون",
  stockAlert: "حد تنبيه المخزون",
  quantity: "الكمية",
  amount: "المبلغ",
  categoryId: "التصنيف",
  category: "التصنيف",
  expenseDate: "تاريخ المصروف",
  note: "الملاحظة",
  notes: "الملاحظات",
  description: "الوصف",
  productId: "المنتج",
  productType: "نوع المنتج",
  newProductId: "المنتج الجديد",
  studentId: "الطالب",
  student: "الطالب",
  paymentMethod: "طريقة الدفع",
  method: "طريقة الدفع",
  academicYearId: "العام الدراسي",
  startDate: "تاريخ البداية",
  endDate: "تاريخ النهاية",
  teacher: "المدرس",
  address: "العنوان",
  minStockQuantity: "حد تنبيه المخزون",
  reservationPrice: "سعر الحجز",
};

const fieldLabel = (ctx) => {
  if (ctx?.label) return ctx.label;
  const name = ctx?.field;
  if (name && FIELD_LABELS[name]) return FIELD_LABELS[name];
  return "هذا الحقل";
};

const isEmpty = (value) => {
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Date) return Number.isNaN(value.getTime());
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (value.file_url !== undefined) {
      return (
        !value.file_url ||
        (typeof value.file_url === "string" && !value.file_url.trim())
      );
    }
    return Object.keys(value).length === 0;
  }
  return value == null || (typeof value === "string" && !value.trim());
};

export default defineNuxtPlugin(() => {
  defineRule("required", (value, _params, ctx) => {
    if (!isEmpty(value)) return true;
    return `${fieldLabel(ctx)} مطلوب`;
  });

  defineRule("email", (value, params, ctx) => {
    if (isEmpty(value)) return true;
    return emailRule(value, params)
      ? true
      : `${fieldLabel(ctx)} يجب أن يكون بريداً إلكترونياً صالحاً`;
  });

  defineRule("min", (value, [limit], ctx) => {
    if (isEmpty(value)) return true;
    return minRule(value, [limit])
      ? true
      : `${fieldLabel(ctx)} يجب ألا يقل عن ${limit} أحرف`;
  });

  defineRule("alpha", (value, params, ctx) => {
    if (isEmpty(value)) return true;
    return alphaRule(value, params)
      ? true
      : `${fieldLabel(ctx)} يجب أن يحتوي على حروف فقط`;
  });

  defineRule("confirmed", (value, params, ctx) => {
    return confirmedRule(value, params)
      ? true
      : `${fieldLabel(ctx)} غير متطابق`;
  });

  defineRule("numeric", (value, params, ctx) => {
    if (isEmpty(value)) return true;
    return numericRule(value, params)
      ? true
      : `${fieldLabel(ctx)} يجب أن يكون رقماً`;
  });

  defineRule("min_value", (value, [limit], ctx) => {
    if (isEmpty(value)) return true;
    return minValueRule(value, [limit])
      ? true
      : `${fieldLabel(ctx)} يجب ألا يقل عن ${limit}`;
  });

  defineRule("max_value", (value, [limit], ctx) => {
    if (isEmpty(value)) return true;
    return maxValueRule(value, [limit])
      ? true
      : `${fieldLabel(ctx)} يجب ألا يزيد عن ${limit}`;
  });

  defineRule("between", (value, [min, max], ctx) => {
    if (isEmpty(value)) return true;
    return betweenRule(value, [min, max])
      ? true
      : `${fieldLabel(ctx)} يجب أن يكون بين ${min} و ${max}`;
  });

  defineRule("fullName", (value) => {
    if (!value) return "من فضلك أدخل الاسم بالكامل";
    const split = String(value).split(" ");
    if (split.length > 1 && split[1].length) {
      return true;
    }
    return "من فضلك أدخل الاسم بالكامل";
  });

  defineRule("url", (value) => {
    if (!value || (typeof value === "string" && !value.trim())) return true;
    const trimmed = typeof value === "string" ? value.trim() : String(value);
    try {
      const u = new URL(trimmed);
      return u.protocol === "http:" || u.protocol === "https:"
        ? true
        : "يجب إدخال رابط صالح";
    } catch {
      return "يجب إدخال رابط صالح";
    }
  });
});

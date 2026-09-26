/**
 * Arabic user-facing messages keyed by backend ErrorCode.
 * Keep in sync with library-management-api `ERROR_DEFINITION`.
 */
export const API_ERROR_MESSAGES_AR: Record<string, string> = {
  // Academic year
  ACADEMIC_YEAR_ACTIVE_REQUIRED: "يجب تحديد سنة دراسية نشطة",
  ACADEMIC_YEAR_ALREADY_ACTIVE: "السنة الدراسية نشطة بالفعل",
  ACADEMIC_YEAR_DATES_INVALID: "تواريخ السنة الدراسية غير صحيحة",
  ACADEMIC_YEAR_END_BEFORE_START:
    "تاريخ نهاية السنة الدراسية يجب أن يكون بعد تاريخ البداية",
  ACADEMIC_YEAR_NAME_EXISTS: "اسم السنة الدراسية موجود بالفعل",
  ACADEMIC_YEAR_NOT_FOUND: "السنة الدراسية غير موجودة",

  // Access / auth
  ACCESS_ADMIN_REQUIRED: "يتطلب صلاحية مسؤول",
  ACCESS_BRANCH_EMPLOYEE_REQUIRED: "يتطلب صلاحية موظف فرع",
  ACCESS_CUSTOMER_SERVICE_REQUIRED: "يتطلب صلاحية خدمة العملاء",
  ACCESS_DENIED: "تم رفض الوصول",
  ACCESS_INSUFFICIENT_PERMISSIONS: "صلاحياتك غير كافية لتنفيذ هذا الإجراء",
  AUTHENTICATION_FAILED: "فشل التحقق من الهوية",
  AUTH_INVALID_CREDENTIALS: "بيانات الدخول غير صحيحة",
  AUTH_TOKEN_REVOKED: "انتهت صلاحية الجلسة. سجّل الدخول مرة أخرى",
  AUTH_USER_INACTIVE: "الحساب غير نشط",

  // Branch
  BRANCH_EMPLOYEE_UNASSIGNED: "الموظف غير مرتبط بأي فرع",
  BRANCH_INACTIVE: "الفرع غير نشط",
  BRANCH_INACTIVE_OR_NOT_FOUND: "الفرع غير نشط أو غير موجود",
  BRANCH_NOT_FOUND: "الفرع غير موجود",
  BRANCH_REQUIRED: "يجب تحديد الفرع",

  // Database / system
  DATABASE_SCHEMA_MISSING: "هيكل قاعدة البيانات غير مكتمل",
  DATABASE_UNAVAILABLE: "قاعدة البيانات غير متاحة حالياً",
  DATABASE_UNIQUE_CONFLICT: "البيانات متعارضة مع سجل موجود مسبقاً",
  INTERNAL: "حدث خطأ غير متوقع. حاول مرة أخرى",
  SERVICE_TEMPORARILY_UNAVAILABLE: "الخدمة غير متاحة مؤقتاً. حاول لاحقاً",

  // Exchange
  EXCHANGE_NOT_FOUND: "عملية الاستبدال غير موجودة",
  EXCHANGE_NO_REMAINING_QUANTITY: "لا توجد كمية متبقية للاستبدال",
  EXCHANGE_QUANTITY_EXCEEDS_REMAINING:
    "كمية الاستبدال تتجاوز الكمية المتبقية",
  EXCHANGE_QUANTITY_INVALID: "كمية الاستبدال غير صحيحة",

  // Expense
  EXPENSE_CATEGORY_INACTIVE: "فئة المصروف غير نشطة",
  EXPENSE_CATEGORY_NOT_FOUND: "فئة المصروف غير موجودة",
  EXPENSE_NOT_FOUND: "المصروف غير موجود",

  // Inventory
  INVENTORY_ADJUSTED_BELOW_RESERVED_QUANTITY:
    "لا يمكن التسوية لأقل من الكمية المحجوزة",
  INVENTORY_AVAILABLE_STOCK_INSUFFICIENT:
    "الكمية المتاحة في المخزون غير كافية",
  INVENTORY_AVAILABLE_STOCK_INSUFFICIENT_TO_RESERVE:
    "الكمية المتاحة غير كافية لإتمام الحجز",
  INVENTORY_BELOW_RESERVED_QUANTITY:
    "الكمية أقل من الكمية المحجوزة",
  INVENTORY_BRANCH_FORBIDDEN: "غير مسموح بالتعامل مع مخزون هذا الفرع",
  INVENTORY_NOT_FOUND: "سجل المخزون غير موجود",
  INVENTORY_PHYSICAL_QUANTITY_NEGATIVE:
    "الكمية الفعلية في المخزون لا يمكن أن تكون سالبة",
  INVENTORY_PHYSICAL_STOCK_INSUFFICIENT:
    "الكمية الفعلية في المخزون غير كافية",
  INVENTORY_QUANTITY_NOT_POSITIVE: "يجب أن تكون الكمية أكبر من صفر",
  INVENTORY_RECORD_NOT_FOUND: "سجل المخزون غير موجود",
  INVENTORY_RESERVED_STOCK_INSUFFICIENT:
    "الكمية المحجوزة في المخزون غير كافية",
  INVENTORY_RESERVED_STOCK_INSUFFICIENT_TO_RELEASE:
    "الكمية المحجوزة غير كافية للإلغاء",

  // Payment
  PAYMENT_METHOD_REQUIRED: "يجب تحديد طريقة الدفع",
  PAYMENT_NOT_FOUND: "الدفعة غير موجودة",
  REFUND_NOT_FOUND: "عملية الاسترداد غير موجودة",
  PAYMENT_SCREENSHOT_FORBIDDEN: "غير مسموح بالوصول لصورة إثبات الدفع",
  PAYMENT_SCREENSHOT_NOT_FOUND: "صورة إثبات الدفع غير موجودة",

  // Product
  PRODUCT_ACADEMIC_YEAR_CHANGE_FORBIDDEN:
    "لا يمكن تغيير السنة الدراسية للمنتج",
  PRODUCT_INACTIVE_OR_NOT_FOUND: "المنتج غير نشط أو غير موجود",
  PRODUCT_NOT_FOUND: "المنتج غير موجود",
  PRODUCT_NOT_RESERVABLE: "هذا المنتج غير قابل للحجز",
  PRODUCT_STUDY_YEAR_REQUIRED: "يجب تحديد السنة الدراسية للمنتج",

  // Generic request / resource
  RECORD_NOT_FOUND: "السجل غير موجود",
  REQUEST_INVALID: "الطلب غير صالح",
  REQUEST_STATE_CONFLICT: "تعارض في حالة الطلب",
  RESOURCE_NOT_FOUND: "المورد غير موجود",

  // Refund
  REFUND_METHOD_REQUIRED: "يجب تحديد طريقة الاسترداد",
  REFUND_PROOF_REQUIRED: "يجب إرفاق إثبات الاسترداد",

  // Replacement product
  REPLACEMENT_PRODUCT_ACADEMIC_YEAR_MISMATCH:
    "منتج البديل لا يتوافق مع السنة الدراسية",
  REPLACEMENT_PRODUCT_INACTIVE_OR_NOT_FOUND:
    "منتج البديل غير نشط أو غير موجود",
  REPLACEMENT_PRODUCT_NOT_RESERVABLE: "منتج البديل غير قابل للحجز",
  REPLACEMENT_PRODUCT_SAME_AS_CURRENT:
    "منتج البديل يجب أن يختلف عن المنتج الحالي",

  // Reports
  REPORT_ACCESS_DENIED: "غير مسموح بالوصول لهذا التقرير",
  REPORT_SECTION_UNSUPPORTED: "قسم التقرير غير مدعوم",

  // Reservation
  RESERVATION_BRANCH_FORBIDDEN: "غير مسموح بالتعامل مع حجز هذا الفرع",
  RESERVATION_CANCEL_REFUND_METHOD_REQUIRED:
    "يجب تحديد طريقة الاسترداد عند إلغاء الحجز",
  RESERVATION_CANNOT_BE_CANCELLED: "لا يمكن إلغاء هذا الحجز",
  RESERVATION_CANNOT_BE_MODIFIED: "لا يمكن تعديل هذا الحجز",
  RESERVATION_CHANGE_REFUND_METHOD_REQUIRED:
    "يجب تحديد طريقة الاسترداد عند تغيير الحجز",
  RESERVATION_CREATE_BRANCH_FORBIDDEN: "غير مسموح بإنشاء حجز لهذا الفرع",
  RESERVATION_DELIVERY_BRANCH_EMPLOYEE_REQUIRED:
    "تسليم الحجز يتطلب صلاحية موظف فرع",
  RESERVATION_DEPOSIT_EXCEEDS_TOTAL:
    "مبلغ العربون يتجاوز إجمالي الحجز",
  RESERVATION_DEPOSIT_NOT_POSITIVE: "يجب أن يكون مبلغ العربون أكبر من صفر",
  RESERVATION_NOT_FOUND: "الحجز غير موجود",
  RESERVATION_NOT_READY_FOR_DELIVERY: "الحجز غير جاهز للتسليم",
  RESERVATION_PAYMENT_METHOD_REQUIRED: "يجب تحديد طريقة الدفع للحجز",
  RESERVATION_PAYMENT_PROOF_REQUIRED: "يجب إرفاق إثبات الدفع للحجز",
  RESERVATION_PRODUCT_ACADEMIC_YEAR_MISMATCH:
    "منتج الحجز لا يتوافق مع السنة الدراسية",
  RESERVATION_REPLACEMENT_PRODUCT_ACADEMIC_YEAR_MISMATCH:
    "منتج البديل في الحجز لا يتوافق مع السنة الدراسية",
  RESERVATION_VIEW_FORBIDDEN: "غير مسموح بعرض هذا الحجز",

  // Return
  RETURN_NOT_FOUND: "المرتجع غير موجود",
  RETURN_QUANTITY_EXCEEDS_REMAINING:
    "كمية المرتجع تتجاوز الكمية المتبقية",
  RETURN_QUANTITY_INVALID: "كمية المرتجع غير صحيحة",

  // Sale
  SALE_ALREADY_RETURNED: "تم إرجاع هذه البيعة مسبقاً",
  SALE_BRANCH_FORBIDDEN: "غير مسموح بالتعامل مع بيعة هذا الفرع",
  SALE_CREATE_BRANCH_EMPLOYEE_REQUIRED:
    "إنشاء البيعة يتطلب صلاحية موظف فرع",
  SALE_ITEM_INVALID: "عنصر البيعة غير صالح",
  SALE_ITEM_NOT_FOUND: "عنصر البيعة غير موجود",
  SALE_ITEM_NO_RETURN_QUANTITY: "لا توجد كمية قابلة للإرجاع لهذا العنصر",
  SALE_NOT_FOUND: "البيعة غير موجودة",
  SALE_PRODUCT_ACADEMIC_YEAR_MISMATCH:
    "منتج البيعة لا يتوافق مع السنة الدراسية",

  // Storage / upload
  STORAGE_KEY_REQUIRED: "مفتاح التخزين مطلوب",
  STORAGE_NOT_CONFIGURED: "خدمة التخزين غير مهيأة",
  UPLOAD_FILE_REQUIRED: "يجب رفع ملف",
  UPLOAD_FILE_TOO_LARGE: "حجم الملف كبير جداً",
  UPLOAD_MIME_TYPE_UNSUPPORTED: "نوع الملف غير مدعوم",

  // Student / study year / teacher
  STUDENT_INACTIVE_OR_NOT_FOUND: "الطالب غير نشط أو غير موجود",
  STUDENT_NOT_FOUND: "الطالب غير موجود",
  STUDY_YEAR_NAME_EXISTS: "اسم السنة الدراسية موجود بالفعل",
  STUDY_YEAR_NOT_FOUND: "السنة الدراسية غير موجودة",
  TEACHER_ACADEMIC_YEAR_MISMATCH:
    "المدرس لا يتوافق مع السنة الدراسية المحددة",
  TEACHER_NOT_FOUND: "المدرس غير موجود",

  // User
  USER_BRANCH_FORBIDDEN: "غير مسموح بالتعامل مع مستخدم هذا الفرع",
  USER_BRANCH_REQUIRED: "يجب تحديد فرع للمستخدم",
  USER_EMAIL_EXISTS: "البريد الإلكتروني مستخدم بالفعل",
  USER_NOT_FOUND: "المستخدم غير موجود",

  // Client-side / fetch helpers
  MISSING_API_BASE: "عنوان واجهة البرمجة غير مهيأ",
  SESSION_CLEARED: "انتهت الجلسة. سجّل الدخول مرة أخرى",
  REQUEST_FAILED: "فشل الطلب. حاول مرة أخرى",
};

export const resolveApiErrorMessage = (
  code: string | undefined | null,
  fallback?: string,
): string => {
  const key = String(code || "").trim();
  if (key && API_ERROR_MESSAGES_AR[key]) {
    return API_ERROR_MESSAGES_AR[key];
  }
  return fallback || "حدث خطأ. حاول مرة أخرى.";
};

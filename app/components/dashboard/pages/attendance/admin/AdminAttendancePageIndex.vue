<template>
  <div class="space-y-6" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-[var(--app-text-strong)]">الحضور والانصراف</span>
      </template>
      <template #content>
        <div class="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-[var(--app-text)]">التاريخ</label>
            <DatePicker
              v-model="filters.date"
              date-format="yy-mm-dd"
              show-icon
              class="w-full"
            />
          </div>

          <AppGlobalSelectBranch
            v-model="filters.branchId"
            label="الفرع"
            placeholder="جميع الفروع"
            include-all-option
            all-option-label="جميع الفروع"
            all-option-value="all"
            label-class="text-[var(--app-text)]"
          />

          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-[var(--app-text)]">الموظف</label>
            <Select
              v-model="filters.employeeId"
              :options="employeeOptions"
              option-label="label"
              option-value="value"
              placeholder="جميع الموظفين"
              filter
              show-clear
              class="w-full"
              :loading="employeesLoading"
            />
          </div>

          <div class="flex flex-col gap-2 text-right">
            <label class="text-sm font-medium text-[var(--app-text)]">الحالة</label>
            <Select
              v-model="filters.status"
              :options="ATTENDANCE_STATUS_OPTIONS"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>

          <Button
            label="بحث"
            icon="pi pi-search"
            class="h-11"
            :loading="loading"
            @click="search"
          />
        </div>

        <AttendanceTable
          :rows="rows"
          :loading="loading"
          :rows-per-page="pagination.perPage"
          :first="pagination.first"
          :total-records="pagination.total"
          @page="onPage"
          @open="openDetail"
        />
      </template>
    </Card>

    <AttendanceDetailDialog
      v-model:visible="detailVisible"
      :employee-id="selected.employeeId"
      :work-date="selected.workDate"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import DatePicker from "primevue/datepicker";
import Select from "primevue/select";
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import { useAppToast } from "~/composables/useAppToast";
import { UserRole } from "~/enums/userRole";
import { userApi } from "~/services/user";
import {
  ATTENDANCE_STATUS_OPTIONS,
  attendanceApi,
  buildAttendanceListQuery,
  cairoTodayDate,
  formatAttendanceTime,
  formatDayLocation,
  formatWorkDateLabel,
} from "~/services/attendance";
import AttendanceTable from "./components/table/AttendanceTable.vue";
import AttendanceDetailDialog from "./components/dialog/AttendanceDetailDialog.vue";

defineOptions({ name: "AdminAttendancePageIndex" });

const { showError } = useAppToast();

const loading = ref(true);
const employeesLoading = ref(false);
const employeeOptions = ref([]);
const rows = ref([]);
const detailVisible = ref(false);
const selected = reactive({ employeeId: "", workDate: "" });
const filters = reactive({
  date: cairoTodayDate(),
  branchId: "all",
  employeeId: null,
  status: "all",
});
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});

const normalizeRow = (day) => ({
  ...day,
  employeeName: day.employee?.fullName || "—",
  branchName: day.branch?.name || "—",
  workDateLabel: formatWorkDateLabel(day.workDate),
  checkInTime: day.checkIn ? formatAttendanceTime(day.checkIn.occurredAt) : "—",
  checkOutTime: day.checkOut ? formatAttendanceTime(day.checkOut.occurredAt) : "—",
  locationLabel: formatDayLocation(day),
});

const loadEmployees = async () => {
  employeesLoading.value = true;
  try {
    const users = await userApi.getUsers();
    employeeOptions.value = users
      .filter((user) => user.role === UserRole.BRANCH_EMPLOYEE)
      .map((user) => ({
        label: user.fullName || user.email,
        value: user.id,
      }));
  } catch (error) {
    showError(error?.message || "تعذر تحميل الموظفين.");
    employeeOptions.value = [];
  } finally {
    employeesLoading.value = false;
  }
};

const loadData = async () => {
  loading.value = true;
  try {
    const result = await attendanceApi.getDays(
      buildAttendanceListQuery({
        page: pagination.page,
        perPage: pagination.perPage,
        filters,
      }),
    );
    rows.value = result.data.map(normalizeRow);
    pagination.total = result.pagination.total;
  } catch (error) {
    showError(error?.message || "تعذر تحميل سجلات الحضور.");
    rows.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const search = () => {
  pagination.page = 1;
  pagination.first = 0;
  loadData();
};

const onPage = (event) => {
  pagination.page = event.page + 1;
  pagination.perPage = event.rows;
  pagination.first = event.first;
  loadData();
};

const openDetail = (row) => {
  selected.employeeId = row.employee?.id || "";
  selected.workDate = row.workDate;
  detailVisible.value = true;
};

onMounted(() => {
  loadEmployees();
  loadData();
});
</script>

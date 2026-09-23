<template>
  <div class="space-y-6" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">البيع المباشر</span>
      </template>

      <template #content>
        <Form
          v-slot="{ errors: fieldErrors, setFieldValue, meta }"
          :key="sales.formKey"
          :initial-values="sales.formInitialValues"
          @submit="sales.submitSale"
        >
          <SalesFormFields
            :sales="sales"
            :field-errors="fieldErrors"
            :set-field-value="setFieldValue"
            :meta="meta"
          />
        </Form>
      </template>
    </Card>

    <SalesSuccessDialog
      v-model:visible="sales.successDialogVisible"
      :sale-summary="sales.saleSummary"
      @close="sales.closeSuccessDialog"
    />
  </div>
</template>

<script setup>
import Card from "primevue/card";
import { Form } from "vee-validate";
import { useSalesPage } from "./composables/useSalesPage";
import SalesFormFields from "~/components/dashboard/pages/sales/components/partials/SalesFormFields.vue";
import SalesSuccessDialog from "~/components/dashboard/pages/sales/components/partials/SalesSuccessDialog.vue";

const sales = useSalesPage();
</script>

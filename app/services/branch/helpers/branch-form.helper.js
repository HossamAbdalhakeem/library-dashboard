import { getStatusTagMeta } from "~/utils/status-tags/catalog";

export const emptyBranchForm = () => ({
  name: "",
  address: "",
  phone: "",
  isActive: true,
});

export const mapBranchToForm = (branch) => ({
  name: branch?.name || "",
  address: branch?.address || "",
  phone: branch?.phone || "",
  isActive: branch ? branch.status !== "INACTIVE" : true,
});

export const buildBranchPayload = (form) => ({
  name: String(form.name || "").trim(),
  address: form.address?.trim() || undefined,
  phone: form.phone?.trim() || undefined,
});

export const normalizeBranchListItem = (branch) => {
  const meta = getStatusTagMeta("entity", branch.status);

  return {
    id: branch.id,
    name: branch.name || "-",
    address: branch.address || "",
    phone: branch.phone || "",
    status: branch.status,
    statusLabel: meta.label,
  };
};

"use client";
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Modal from "@/components/ui/Modal";
import { TextField, SelectField } from "@/components/ui/FormField";
import Badge, { statusTone } from "@/components/ui/Badge";
import {
  PageHeader,
  Toolbar,
  SearchInput,
  FilterSelect,
  AddButton,
  TableShell,
  TableHead,
  EmptyRow,
  RowActions,
  FormErrorBanner,
  ModalFooter,
} from "@/components/ui/PageParts";
import { motion } from "framer-motion";
import { useCrud } from "@/hooks/useCrud";
import { Resident, ZONES } from "@/types";

const STATUS_OPTIONS = ["Active", "Deceased", "Moved Out"];

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  contactNo: "",
  streetAddress: "",
  zoneAssignment: "Zone I",
  gender: "Male",
  civilStatus: "Single",
  accountStatus: "Active",
  age: "",
  isVoter: "No",
};

export default function ResidentsPage() {
  const { items: residents, error, setError, create, update, remove } = useCrud<Resident>({
    endpoint: "/api/residents",
    extractList: (data) => (Array.isArray(data) ? data : data.residents || []),
    getId: (r) => r._id,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const openAddModal = () => {
    setError("");
    setIsEditMode(false);
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (res: Resident) => {
    setError("");
    setEditingId(res._id ?? null);
    setFormData({
      firstName: res.firstName,
      middleName: res.middleName || "",
      lastName: res.lastName,
      contactNo: res.contactNo || "",
      streetAddress: res.streetAddress || "",
      zoneAssignment: res.zoneAssignment || "Zone I",
      gender: res.gender,
      civilStatus: res.civilStatus,
      accountStatus: res.accountStatus || "Active",
      age: res.age !== undefined ? String(res.age) : "",
      isVoter: res.isVoter || "No",
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, age: formData.age ? Number(formData.age) : "" };

    const result = isEditMode && editingId ? await update(editingId, payload) : await create(payload);

    if (result.ok) {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      setFormData(emptyForm);
    }
  };

  const handleDelete = async (res: Resident) => {
    const confirmed = confirm(`Are you sure you want to remove ${res.firstName} ${res.lastName} from the list of residents?`);
    if (!confirmed) return;
    const result = await remove(res);
    if (!result.ok) alert(result.error);
  };

  const filteredResidents = residents.filter((res) => {
    const fullName = `${res.firstName} ${res.lastName}`.toLowerCase();
    const searchId = (res.residentId || "").toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      (res.contactNo || "").includes(searchQuery) ||
      searchId.includes(searchQuery.toLowerCase());

    const matchesZone = zoneFilter === "All" || res.zoneAssignment === zoneFilter;
    const matchesStatus = statusFilter === "All" || res.accountStatus === statusFilter;

    return matchesSearch && matchesZone && matchesStatus;
  });

  return (
    <DashboardLayout activeMenu="Resident Information">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        <PageHeader
          title="Resident Information Directory"
          subtitle="Profile logs, community demographic listings, and local residency markers"
        />

        <Toolbar>
          <div className="flex flex-wrap items-center gap-4">
            <AddButton label="Add Resident" onClick={openAddModal} />

            <FilterSelect
              value={zoneFilter}
              onChange={setZoneFilter}
              options={[{ value: "All", label: "All Zones" }, ...ZONES.map((z) => ({ value: z, label: z }))]}
            />

            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[{ value: "All", label: "All Status" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]}
            />
          </div>

          <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search name or ID..." />
        </Toolbar>

        <TableShell>
          <TableHead
            columns={["Resident ID", "Full Name", "Contact", "Address", "Zone / Sector", "Gender", "Age", "Voter?", "Status", "Actions"]}
          />
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700 font-medium">
            {filteredResidents.length > 0 ? (
              filteredResidents.map((res, idx) => (
                <motion.tr
                  key={res._id || idx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.25) }}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="p-4 font-mono font-bold text-emerald-700 text-xs">{res.residentId || "PENDING"}</td>
                  <td className="p-4 font-bold text-gray-900">
                    {`${res.firstName} ${res.middleName ? res.middleName + " " : ""}${res.lastName}`}
                  </td>
                  <td className="p-4 font-mono text-gray-600">{res.contactNo}</td>
                  <td className="p-4 text-gray-500">{res.streetAddress}</td>
                  <td className="p-4">
                    <Badge tone="slate">{res.zoneAssignment}</Badge>
                  </td>
                  <td className="p-4 text-gray-500">{res.gender}</td>
                  <td className="p-4 font-bold text-slate-700">{res.age !== undefined && res.age !== "" ? res.age : "N/A"}</td>
                  <td className="p-4">
                    <Badge tone={res.isVoter === "Yes" ? "blue" : "slate"}>{res.isVoter || "No"}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge tone={statusTone(res.accountStatus)} pill>
                      {res.accountStatus}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <RowActions onEdit={() => openEditModal(res)} onDelete={() => handleDelete(res)} />
                  </td>
                </motion.tr>
              ))
            ) : (
              <EmptyRow colSpan={10} label="No resident files found" />
            )}
          </tbody>
        </TableShell>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditMode ? "Modifying Resident Profile Logs" : "Census Registry: Encode Resident Record"}
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <FormErrorBanner message={error} />

            <div className="grid grid-cols-3 gap-2">
              <TextField
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <TextField
                label="Middle Name"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
              <TextField
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <TextField
                label="Contact No."
                required
                wrapperClassName="col-span-2"
                value={formData.contactNo}
                onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
              />
              <TextField
                label="Age"
                type="number"
                required
                placeholder="65"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>

            <SelectField
              label="Zone Assignment"
              value={formData.zoneAssignment}
              onChange={(e) => setFormData({ ...formData, zoneAssignment: e.target.value })}
              options={ZONES.map((z) => ({ value: z }))}
            />

            <TextField
              label="Street Address"
              required
              value={formData.streetAddress}
              onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
            />

            <div className="grid grid-cols-4 gap-2">
              <SelectField
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                options={[{ value: "Male" }, { value: "Female" }]}
              />
              <SelectField
                label="Civil Status"
                value={formData.civilStatus}
                onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                options={[{ value: "Single" }, { value: "Married" }, { value: "Widowed" }]}
              />
              <SelectField
                label="Voter?"
                value={formData.isVoter}
                onChange={(e) => setFormData({ ...formData, isVoter: e.target.value })}
                options={[{ value: "Yes" }, { value: "No" }]}
              />
              <SelectField
                label="Status"
                value={formData.accountStatus}
                onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                options={STATUS_OPTIONS.map((s) => ({ value: s }))}
              />
            </div>

            <ModalFooter isEditMode={isEditMode} onCancel={() => setIsModalOpen(false)} />
          </form>
        </Modal>
      </motion.div>
    </DashboardLayout>
  );
}

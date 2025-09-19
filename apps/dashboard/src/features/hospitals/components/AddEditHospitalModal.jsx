import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  Building2,
  Bed,
  Activity,
  Plus,
  Minus,
  Shield,
  Save,
} from "lucide-react";
import { clsx } from "clsx";

// Validation schema
const hospitalSchema = yup.object({
  name: yup
    .string()
    .required("Hospital name is required")
    .min(2, "Name must be at least 2 characters"),
  location: yup.string().required("Location is required"),
  address: yup.string().required("Address is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^\+?[\d\s\-()]+$/, "Invalid phone number format"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  totalBeds: yup
    .number()
    .required("Total beds is required")
    .min(1, "Must have at least 1 bed"),
  availableBeds: yup.number().required("Available beds is required").min(0),
  icuBeds: yup.number().required("ICU beds is required").min(0),
  availableIcuBeds: yup
    .number()
    .required("Available ICU beds is required")
    .min(0),
  emergencyRoom: yup.string().required("Emergency room level is required"),
  status: yup.string().required("Status is required"),
});

const AddEditHospitalModal = ({
  hospital,
  isOpen,
  onClose,
  onSave,
  isLoading,
}) => {
  const [specialties, setSpecialties] = useState(hospital?.specialties || []);
  const [newSpecialty, setNewSpecialty] = useState("");

  const isEditing = !!hospital;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(hospitalSchema),
    defaultValues: {
      name: hospital?.name || "",
      location: hospital?.location || "",
      address: hospital?.address || "",
      phone: hospital?.phone || "",
      email:
        hospital?.email ||
        `info@${hospital?.name?.toLowerCase().replace(/\s+/g, "") || "hospital"}.com`,
      totalBeds: hospital?.totalBeds || 100,
      availableBeds: hospital?.availableBeds || 50,
      icuBeds: hospital?.icuBeds || 20,
      availableIcuBeds: hospital?.availableIcuBeds || 10,
      emergencyRoom: hospital?.emergencyRoom || "Level I Trauma Center",
      status: hospital?.status || "operational",
    },
  });

  const watchedValues = watch();

  // Validation for available beds
  useEffect(() => {
    if (watchedValues.availableBeds > watchedValues.totalBeds) {
      setValue("availableBeds", watchedValues.totalBeds);
    }
    if (watchedValues.availableIcuBeds > watchedValues.icuBeds) {
      setValue("availableIcuBeds", watchedValues.icuBeds);
    }
  }, [
    watchedValues.totalBeds,
    watchedValues.icuBeds,
    watchedValues.availableBeds,
    watchedValues.availableIcuBeds,
    setValue,
  ]);

  // Reset form when hospital prop changes (for editing)
  useEffect(() => {
    if (hospital && isOpen) {
      // eslint-disable-next-line no-console
      console.log("Resetting form with hospital data:", hospital);
      reset({
        name: hospital.name || "",
        location: hospital.location || "",
        address: hospital.address || "",
        phone: hospital.phone || "",
        email:
          hospital.email ||
          `info@${hospital.name?.toLowerCase().replace(/\s+/g, "") || "hospital"}.com`,
        totalBeds: hospital.totalBeds || 100,
        availableBeds: hospital.availableBeds || 50,
        icuBeds: hospital.icuBeds || 20,
        availableIcuBeds: hospital.availableIcuBeds || 10,
        emergencyRoom: hospital.emergencyRoom || "Level I Trauma Center",
        status: hospital.status || "operational",
      });
      setSpecialties(hospital.specialties || []);
    } else if (!hospital && isOpen) {
      // eslint-disable-next-line no-console
      console.log("Resetting form for new hospital");
      // Reset for new hospital
      reset({
        name: "",
        location: "",
        address: "",
        phone: "",
        email: "",
        totalBeds: 100,
        availableBeds: 50,
        icuBeds: 20,
        availableIcuBeds: 10,
        emergencyRoom: "Level I Trauma Center",
        status: "operational",
      });
      setSpecialties([]);
    }
  }, [hospital, isOpen, reset]);

  // Don't render if not open
  if (!isOpen) return null;

  const addSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (index) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    const hospitalData = {
      ...data,
      specialties,
      id: hospital?.id || Date.now(),
      rating: hospital?.rating || 4.5,
      responseTime: hospital?.responseTime || "10 min",
      lastUpdated: "Just now",
      coordinates: hospital?.coordinates || { lat: 40.7128, lng: -74.006 },
    };

    await onSave(hospitalData);
  };

  const emergencyRoomOptions = [
    "Level I Trauma Center",
    "Level II Trauma Center",
    "Level III Trauma Center",
    "Level IV Trauma Center",
    "Emergency Department",
  ];

  const statusOptions = [
    { value: "operational", label: "Operational", color: "text-green-600" },
    {
      value: "maintenance",
      label: "Under Maintenance",
      color: "text-yellow-600",
    },
    { value: "critical", label: "Critical Status", color: "text-red-600" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900">
                  {isEditing ? "Edit Hospital" : "Add New Hospital"}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditing
                    ? "Update hospital information"
                    : "Register a new hospital in the network"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-h-[60vh] overflow-y-auto p-6"
        >
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Building2 className="h-5 w-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Hospital Name *
                  </label>
                  <input
                    id="name"
                    {...register("name")}
                    type="text"
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 focus:outline-none",
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                    placeholder="Enter hospital name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Location *
                  </label>
                  <input
                    id="location"
                    {...register("location")}
                    type="text"
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 focus:outline-none",
                      errors.location
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                    placeholder="e.g., Downtown Medical District"
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Address *
                  </label>
                  <input
                    id="address"
                    {...register("address")}
                    type="text"
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 focus:outline-none",
                      errors.address
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                    placeholder="Full hospital address"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    {...register("phone")}
                    type="tel"
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 focus:outline-none",
                      errors.phone
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Email Address *
                  </label>
                  <input
                    id="email"
                    {...register("email")}
                    type="email"
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 focus:outline-none",
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                    placeholder="contact@hospital.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Capacity Information */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Bed className="h-5 w-5" />
                Capacity Information
              </h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="totalBeds"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Total Beds *
                  </label>
                  <input
                    id="totalBeds"
                    {...register("totalBeds", { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 focus:outline-none",
                      errors.totalBeds
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                    placeholder="100"
                  />
                  {errors.totalBeds && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.totalBeds.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="availableBeds"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Available Beds *
                  </label>
                  <input
                    id="availableBeds"
                    {...register("availableBeds", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max={watchedValues.totalBeds}
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 focus:outline-none",
                      errors.availableBeds
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                    placeholder="50"
                  />
                  {errors.availableBeds && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.availableBeds.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="icuBeds"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Total ICU Beds *
                  </label>
                  <input
                    id="icuBeds"
                    {...register("icuBeds", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 focus:outline-none",
                      errors.icuBeds
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                    placeholder="20"
                  />
                  {errors.icuBeds && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.icuBeds.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="availableIcuBeds"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Available ICU Beds *
                  </label>
                  <input
                    id="availableIcuBeds"
                    {...register("availableIcuBeds", { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max={watchedValues.icuBeds}
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:ring-2 focus:outline-none",
                      errors.availableIcuBeds
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                    placeholder="10"
                  />
                  {errors.availableIcuBeds && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.availableIcuBeds.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Services and Status */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Shield className="h-5 w-5" />
                Services & Status
              </h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="emergencyRoom"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Emergency Room Level *
                  </label>
                  <select
                    id="emergencyRoom"
                    {...register("emergencyRoom")}
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 transition-colors focus:ring-2 focus:outline-none",
                      errors.emergencyRoom
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                  >
                    {emergencyRoomOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.emergencyRoom && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyRoom.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Status *
                  </label>
                  <select
                    id="status"
                    {...register("status")}
                    className={clsx(
                      "w-full rounded-lg border px-3 py-2 text-gray-900 transition-colors focus:ring-2 focus:outline-none",
                      errors.status
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20",
                    )}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.status.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Specialties */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Activity className="h-5 w-5" />
                Medical Specialties
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="Add a medical specialty"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSpecialty())
                    }
                  />
                  <button
                    type="button"
                    onClick={addSpecialty}
                    className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                {specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700"
                      >
                        {specialty}
                        <button
                          type="button"
                          onClick={() => removeSpecialty(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {specialties.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                    <Activity className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      No specialties added yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading
                ? "Saving..."
                : isEditing
                  ? "Update Hospital"
                  : "Add Hospital"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddEditHospitalModal;

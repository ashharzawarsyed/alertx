import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  User,
  Heart,
  Plus,
  Minus,
  Save,
  CreditCard,
  UserCheck,
  Pill,
  ShieldAlert,
} from "lucide-react";
import { clsx } from "clsx";

// Validation schema
const patientSchema = yup.object({
  firstName: yup
    .string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: yup
    .string()
    .required("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  age: yup
    .number()
    .required("Age is required")
    .min(1, "Age must be at least 1")
    .max(120, "Age must be less than 120"),
  gender: yup.string().required("Gender is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^\+?[\d\s\-()]+$/, "Invalid phone number format"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  address: yup.string().required("Address is required"),
  bloodType: yup.string().required("Blood type is required"),
  currentStatus: yup.string().required("Status is required"),
  priority: yup.string().required("Priority is required"),
  emergencyContactName: yup
    .string()
    .required("Emergency contact name is required"),
  emergencyContactRelationship: yup
    .string()
    .required("Emergency contact relationship is required"),
  emergencyContactPhone: yup
    .string()
    .required("Emergency contact phone is required"),
  insuranceProvider: yup.string().required("Insurance provider is required"),
  insurancePolicyNumber: yup.string().required("Policy number is required"),
  insuranceGroupNumber: yup.string().required("Group number is required"),
});

const AddEditPatientModal = ({
  patient,
  isOpen,
  onClose,
  onSave,
  isLoading,
}) => {
  const [allergies, setAllergies] = useState(patient?.allergies || []);
  const [newAllergy, setNewAllergy] = useState("");
  const [medicalConditions, setMedicalConditions] = useState(
    patient?.medicalConditions || [],
  );
  const [newMedicalCondition, setNewMedicalCondition] = useState("");
  const [currentMedications, setCurrentMedications] = useState(
    patient?.currentMedications || [],
  );
  const [newMedication, setNewMedication] = useState("");

  const isEditing = !!patient;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(patientSchema),
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      age: patient?.age || 25,
      gender: patient?.gender || "Male",
      phone: patient?.phone || "",
      email: patient?.email || "",
      address: patient?.address || "",
      bloodType: patient?.bloodType || "O+",
      currentStatus: patient?.currentStatus || "stable",
      priority: patient?.priority || "low",
      emergencyContactName: patient?.emergencyContact?.name || "",
      emergencyContactRelationship:
        patient?.emergencyContact?.relationship || "",
      emergencyContactPhone: patient?.emergencyContact?.phone || "",
      insuranceProvider: patient?.insurance?.provider || "",
      insurancePolicyNumber: patient?.insurance?.policyNumber || "",
      insuranceGroupNumber: patient?.insurance?.groupNumber || "",
    },
  });

  // Reset form when patient prop changes (for editing)
  useEffect(() => {
    if (patient && isOpen) {
      reset({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        age: patient.age || 25,
        gender: patient.gender || "Male",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        bloodType: patient.bloodType || "O+",
        currentStatus: patient.currentStatus || "stable",
        priority: patient.priority || "low",
        emergencyContactName: patient.emergencyContact?.name || "",
        emergencyContactRelationship:
          patient.emergencyContact?.relationship || "",
        emergencyContactPhone: patient.emergencyContact?.phone || "",
        insuranceProvider: patient.insurance?.provider || "",
        insurancePolicyNumber: patient.insurance?.policyNumber || "",
        insuranceGroupNumber: patient.insurance?.groupNumber || "",
      });
      setAllergies(patient.allergies || []);
      setMedicalConditions(patient.medicalConditions || []);
      setCurrentMedications(patient.currentMedications || []);
    } else if (!patient && isOpen) {
      // Reset for new patient
      reset({
        firstName: "",
        lastName: "",
        age: 25,
        gender: "Male",
        phone: "",
        email: "",
        address: "",
        bloodType: "O+",
        currentStatus: "stable",
        priority: "low",
        emergencyContactName: "",
        emergencyContactRelationship: "",
        emergencyContactPhone: "",
        insuranceProvider: "",
        insurancePolicyNumber: "",
        insuranceGroupNumber: "",
      });
      setAllergies([]);
      setMedicalConditions([]);
      setCurrentMedications([]);
    }
  }, [patient, isOpen, reset]);

  // Don't render if not open
  if (!isOpen) return null;

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const addMedicalCondition = () => {
    if (
      newMedicalCondition.trim() &&
      !medicalConditions.includes(newMedicalCondition.trim())
    ) {
      setMedicalConditions([...medicalConditions, newMedicalCondition.trim()]);
      setNewMedicalCondition("");
    }
  };

  const removeMedicalCondition = (index) => {
    setMedicalConditions(medicalConditions.filter((_, i) => i !== index));
  };

  const addMedication = () => {
    if (
      newMedication.trim() &&
      !currentMedications.includes(newMedication.trim())
    ) {
      setCurrentMedications([...currentMedications, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const removeMedication = (index) => {
    setCurrentMedications(currentMedications.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    const patientData = {
      ...data,
      allergies,
      medicalConditions,
      currentMedications,
      emergencyContact: {
        name: data.emergencyContactName,
        relationship: data.emergencyContactRelationship,
        phone: data.emergencyContactPhone,
      },
      insurance: {
        provider: data.insuranceProvider,
        policyNumber: data.insurancePolicyNumber,
        groupNumber: data.insuranceGroupNumber,
      },
      id: patient?.id || Date.now(),
      lastVisit: patient?.lastVisit || new Date().toISOString().split("T")[0],
      emergencyHistory: patient?.emergencyHistory || [],
      vitals: patient?.vitals || {
        bloodPressure: "120/80",
        heartRate: 72,
        temperature: 98.6,
        oxygenSaturation: 98,
      },
      assignedHospital: patient?.assignedHospital || null,
    };

    await onSave(patientData);
  };

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
        <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-gray-900">
                  {isEditing ? "Edit Patient" : "Add New Patient"}
                </h2>
                <p className="text-sm text-gray-600">
                  {isEditing
                    ? "Update patient information"
                    : "Enter patient details"}
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

        {/* Form Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    {...register("firstName")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.firstName
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    {...register("lastName")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.lastName
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="age"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Age *
                  </label>
                  <input
                    id="age"
                    type="number"
                    {...register("age", { valueAsNumber: true })}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.age
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="Enter age"
                  />
                  {errors.age && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.age.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="gender"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Gender *
                  </label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.gender
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Phone *
                  </label>
                  <input
                    id="phone"
                    {...register("phone")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.phone
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
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
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.email
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="patient@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Address *
                  </label>
                  <input
                    id="address"
                    {...register("address")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.address
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="123 Main St, City, State"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-red-50 to-pink-50 p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Heart className="h-5 w-5 text-red-600" />
                Medical Information
              </h3>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="bloodType"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Blood Type *
                  </label>
                  <select
                    id="bloodType"
                    {...register("bloodType")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.bloodType
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {errors.bloodType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.bloodType.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="currentStatus"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Current Status *
                  </label>
                  <select
                    id="currentStatus"
                    {...register("currentStatus")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.currentStatus
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                  >
                    <option value="stable">Stable</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="critical">Critical</option>
                  </select>
                  {errors.currentStatus && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.currentStatus.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Priority *
                  </label>
                  <select
                    id="priority"
                    {...register("priority")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.priority
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {errors.priority && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.priority.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="mb-6">
                <label
                  htmlFor="newAllergy"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  <ShieldAlert className="mr-1 inline h-4 w-4" />
                  Allergies
                </label>
                <div className="mb-2 flex gap-2">
                  <input
                    id="newAllergy"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAllergy())
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add allergy"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addAllergy}
                    className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1"
                    >
                      <span className="text-sm text-orange-700">{allergy}</span>
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Conditions */}
              <div className="mb-6">
                <label
                  htmlFor="newMedicalCondition"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  <Heart className="mr-1 inline h-4 w-4" />
                  Medical Conditions
                </label>
                <div className="mb-2 flex gap-2">
                  <input
                    id="newMedicalCondition"
                    value={newMedicalCondition}
                    onChange={(e) => setNewMedicalCondition(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addMedicalCondition())
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add medical condition"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addMedicalCondition}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {medicalConditions.map((condition, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1"
                    >
                      <span className="text-sm text-blue-700">{condition}</span>
                      <button
                        type="button"
                        onClick={() => removeMedicalCondition(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <label
                  htmlFor="newMedication"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  <Pill className="mr-1 inline h-4 w-4" />
                  Current Medications
                </label>
                <div className="mb-2 flex gap-2">
                  <input
                    id="newMedication"
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addMedication())
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add medication"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addMedication}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentMedications.map((medication, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1"
                    >
                      <span className="text-sm text-purple-700">
                        {medication}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-teal-50 p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <UserCheck className="h-5 w-5 text-green-600" />
                Emergency Contact
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="emergencyContactName"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Contact Name *
                  </label>
                  <input
                    id="emergencyContactName"
                    {...register("emergencyContactName")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.emergencyContactName
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="Enter contact name"
                  />
                  {errors.emergencyContactName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyContactName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="emergencyContactRelationship"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Relationship *
                  </label>
                  <input
                    id="emergencyContactRelationship"
                    {...register("emergencyContactRelationship")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.emergencyContactRelationship
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                  {errors.emergencyContactRelationship && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyContactRelationship.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="emergencyContactPhone"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Contact Phone *
                  </label>
                  <input
                    id="emergencyContactPhone"
                    {...register("emergencyContactPhone")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.emergencyContactPhone
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyContactPhone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
              <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <CreditCard className="h-5 w-5 text-indigo-600" />
                Insurance Information
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="insuranceProvider"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Insurance Provider *
                  </label>
                  <input
                    id="insuranceProvider"
                    {...register("insuranceProvider")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.insuranceProvider
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="e.g., Blue Cross, Aetna"
                  />
                  {errors.insuranceProvider && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.insuranceProvider.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="insurancePolicyNumber"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Policy Number *
                  </label>
                  <input
                    id="insurancePolicyNumber"
                    {...register("insurancePolicyNumber")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.insurancePolicyNumber
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="Policy number"
                  />
                  {errors.insurancePolicyNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.insurancePolicyNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="insuranceGroupNumber"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Group Number *
                  </label>
                  <input
                    id="insuranceGroupNumber"
                    {...register("insuranceGroupNumber")}
                    className={clsx(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      errors.insuranceGroupNumber
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                    )}
                    placeholder="Group number"
                  />
                  {errors.insuranceGroupNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.insuranceGroupNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className={clsx(
                  "flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors",
                  isLoading
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-purple-600 hover:bg-purple-700",
                )}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isLoading
                  ? "Saving..."
                  : isEditing
                    ? "Update Patient"
                    : "Add Patient"}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddEditPatientModal;

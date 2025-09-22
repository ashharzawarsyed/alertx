import {
  Eye,
  EyeSlash,
  MapPin,
  Phone,
  Buildings,
  User,
  Envelope,
  ShieldCheck,
  CheckCircle,
} from "phosphor-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../hooks/useAuth";
import LocationCollector from "../../location/components/LocationCollector";

const SignUpPage = () => {
  const { signup } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Hospital Information
    hospitalName: "",
    hospitalType: "",
    licenseNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    latitude: "",
    longitude: "",
    contactNumber: "",
    email: "",

    // Hospital Details
    totalBeds: {
      general: "",
      icu: "",
      emergency: "",
      operation: "",
    },
    facilities: [],
    emergencyContact: "",
    operatingHours: {
      isOpen24x7: true,
      openTime: "",
      closeTime: "",
    },

    // Administrator Details
    adminName: "",
    adminPosition: "Hospital Administrator",
    department: "Administration",
    password: "",
    confirmPassword: "",

    // Terms and Conditions
    agreeToTerms: false,
    agreeToPrivacy: false,
  });

  const facilityOptions = [
    "Emergency Room",
    "ICU",
    "Surgery",
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Maternity",
    "Radiology",
    "Laboratory",
    "Pharmacy",
    "Ambulance Service",
    "Blood Bank",
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleFacilityChange = (facility) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1: // Hospital Basic Info
        return (
          formData.hospitalName &&
          formData.hospitalType &&
          formData.licenseNumber &&
          formData.address &&
          formData.city &&
          formData.state &&
          formData.zipCode &&
          formData.country
        );
      case 2: // Contact & Location
        return formData.contactNumber && formData.email && formData.address;
      case 3: // Hospital Capacity
        return (
          formData.totalBeds.general > 0 &&
          formData.totalBeds.icu > 0 &&
          formData.totalBeds.emergency > 0 &&
          formData.totalBeds.operation > 0
        );
      case 4: // Facilities & Hours
        return (
          formData.facilities.length > 0 &&
          formData.emergencyContact &&
          (formData.operatingHours.isOpen24x7 ||
            (formData.operatingHours.openTime &&
              formData.operatingHours.closeTime))
        );
      case 5: // Admin Details
        return (
          formData.adminName &&
          formData.adminPosition &&
          formData.email &&
          formData.password &&
          formData.confirmPassword === formData.password &&
          formData.password.length >= 8
        );
      case 6: // Terms & Conditions
        return formData.agreeToTerms && formData.agreeToPrivacy;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      setError("");
    } else {
      setError("Please fill in all required fields correctly.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(6)) {
      setError("Please complete all steps and accept terms and conditions.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const location = {
        lat: parseFloat(formData.latitude) || 0,
        lng: parseFloat(formData.longitude) || 0,
      };

      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;

      await signup({
        hospitalName: formData.hospitalName,
        address: fullAddress,
        location,
        contactNumber: formData.contactNumber,
        email: formData.email,
        totalBeds: {
          general: parseInt(formData.totalBeds.general),
          icu: parseInt(formData.totalBeds.icu),
          emergency: parseInt(formData.totalBeds.emergency),
          operation: parseInt(formData.totalBeds.operation) || 0,
        },
        facilities: formData.facilities,
        operatingHours: formData.operatingHours,
        adminName: formData.adminName,
        password: formData.password,
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <CheckCircle
            size={64}
            className="text-green-500 mx-auto mb-4"
            weight="duotone"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Registration Submitted!
          </h2>
          <p className="text-gray-600 mb-6">
            Your hospital registration has been submitted successfully. Please
            wait for admin approval before you can access the dashboard.
          </p>
          <Link
            to="/auth/signin"
            className="inline-block bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Hospital Basic Information
              </h3>
              <p className="text-gray-600">Tell us about your hospital</p>
            </div>{" "}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name *
              </label>
              <div className="relative">
                <Buildings
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                  placeholder="City General Hospital"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Type *
                </label>
                <select
                  name="hospitalType"
                  value={formData.hospitalType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                >
                  <option value="">Select hospital type</option>
                  <option value="General Hospital">General Hospital</option>
                  <option value="Specialty Hospital">Specialty Hospital</option>
                  <option value="Emergency Center">Emergency Center</option>
                  <option value="Urgent Care">Urgent Care</option>
                  <option value="Trauma Center">Trauma Center</option>
                  <option value="Children's Hospital">
                    Children&apos;s Hospital
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number *
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  placeholder="Hospital license number"
                  className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Address *
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Medical Center Drive"
                  rows={3}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="New York"
                  className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="NY"
                  className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  placeholder="10001"
                  className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="United States"
                  className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Contact & Location
              </h3>
              <p className="text-gray-600">How can we reach you?</p>
            </div>{" "}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    placeholder="+1-555-0123"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Official Email *
                </label>
                <div className="relative">
                  <Envelope
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="contact@hospital.com"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will be your login email for all hospital staff
                </p>
              </div>
            </div>
            <div className="mt-8">
              <LocationCollector
                onLocationUpdate={(locationData) => {
                  setFormData((prev) => ({
                    ...prev,
                    latitude:
                      locationData.coordinates?.latitude?.toString() || "",
                    longitude:
                      locationData.coordinates?.longitude?.toString() || "",
                    address: locationData.address || prev.address,
                  }));
                }}
                initialAddress={`${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`
                  .replace(/^,+|,+$/g, "")
                  .replace(/,+/g, ", ")}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Hospital Capacity & Facilities
              </h3>
              <p className="text-gray-600">
                Bed capacity and available facilities
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Bed Capacity *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    General Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="totalBeds.general"
                    value={formData.totalBeds.general}
                    onChange={handleChange}
                    required
                    placeholder="50"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    ICU Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="totalBeds.icu"
                    value={formData.totalBeds.icu}
                    onChange={handleChange}
                    required
                    placeholder="10"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Emergency Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="totalBeds.emergency"
                    value={formData.totalBeds.emergency}
                    onChange={handleChange}
                    required
                    placeholder="15"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Operation Rooms
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="totalBeds.operation"
                    value={formData.totalBeds.operation}
                    onChange={handleChange}
                    placeholder="5"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Available Facilities
              </label>
              <div className="grid grid-cols-2 gap-3">
                {facilityOptions.map((facility) => (
                  <label
                    key={facility}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.facilities.includes(facility)}
                      onChange={() => handleFacilityChange(facility)}
                      className="rounded border-gray-300 text-blue-400 focus:ring-blue-400"
                    />
                    <span className="text-sm text-gray-700">{facility}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Hours
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="operatingHours.isOpen24x7"
                    checked={formData.operatingHours.isOpen24x7}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-400 focus:ring-blue-400"
                  />
                  <span className="text-sm text-gray-700">Open 24/7</span>
                </label>

                {!formData.operatingHours.isOpen24x7 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Open Time
                      </label>
                      <input
                        type="time"
                        name="operatingHours.openTime"
                        value={formData.operatingHours.openTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Close Time
                      </label>
                      <input
                        type="time"
                        name="operatingHours.closeTime"
                        value={formData.operatingHours.closeTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Facilities & Services
              </h3>
              <p className="text-gray-600">
                Additional services and emergency contact
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Available Services
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Emergency Care",
                  "Surgery",
                  "Maternity",
                  "Pediatrics",
                  "Cardiology",
                  "Neurology",
                ].map((service) => (
                  <label
                    key={service}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.services?.includes(service) || false}
                      onChange={(e) => {
                        const newServices = e.target.checked
                          ? [...(formData.services || []), service]
                          : (formData.services || []).filter(
                              (s) => s !== service
                            );
                        setFormData((prev) => ({
                          ...prev,
                          services: newServices,
                        }));
                      }}
                      className="rounded border-gray-300 text-blue-400 focus:ring-blue-400"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="emergencyContact"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Emergency Contact Number *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="emergencyContact"
                  type="tel"
                  name="emergencyContact"
                  value={formData.emergencyContact || ""}
                  onChange={handleChange}
                  required
                  placeholder="+1 (555) 911-1234"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Administrator Account
              </h3>
              <p className="text-gray-600">
                Create your admin account for hospital management
              </p>
            </div>

            <div>
              <label
                htmlFor="adminName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Administrator Name *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  id="adminName"
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                  placeholder="Dr. John Smith"
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="adminPosition"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Position *
                </label>
                <input
                  id="adminPosition"
                  type="text"
                  name="adminPosition"
                  value={formData.adminPosition}
                  onChange={handleChange}
                  required
                  placeholder="Hospital Administrator"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Department
                </label>
                <input
                  id="department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Administration"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 bg-gray-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlash size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {formData.confirmPassword &&
                formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Terms & Conditions
              </h3>
              <p className="text-gray-600">
                Please review and accept our terms
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 rounded border-gray-300 text-blue-400 focus:ring-blue-400"
                  id="agreeToTerms"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                  <span className="font-medium">
                    I agree to the Terms and Conditions *
                  </span>
                  <p className="text-gray-600 mt-1">
                    By checking this box, you agree to comply with all AlertX
                    hospital management system terms, including data protection,
                    patient privacy, and system usage policies.
                  </p>
                </label>
              </div>

              <div className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleChange}
                  className="mt-1 rounded border-gray-300 text-blue-400 focus:ring-blue-400"
                  id="agreeToPrivacy"
                />
                <label
                  htmlFor="agreeToPrivacy"
                  className="text-sm text-gray-700"
                >
                  <span className="font-medium">
                    I agree to the Privacy Policy *
                  </span>
                  <p className="text-gray-600 mt-1">
                    You consent to the collection, storage, and processing of
                    hospital and patient data in accordance with healthcare
                    regulations and our privacy policy.
                  </p>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="text-blue-600 mt-1" size={20} />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">
                    Admin Approval Required
                  </p>
                  <p className="text-blue-700 mt-1">
                    Your hospital registration will be reviewed by AlertX
                    administrators. You&apos;ll receive email notification once
                    approved and can then access your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Left Side - Visual/Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Aesthetic Background Pattern */}
        <div className="absolute inset-0">
          {/* Multi-layer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/30 to-purple-600/20"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-600/10 via-transparent to-blue-400/10"></div>

          {/* Floating Geometric Shapes */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/8 rounded-full backdrop-blur-sm border border-white/10"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white/12 rounded-2xl rotate-45 backdrop-blur-sm border border-white/15"></div>
          <div className="absolute bottom-32 left-32 w-20 h-20 bg-white/8 rounded-full backdrop-blur-sm border border-white/10"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/12 rounded-xl rotate-12 backdrop-blur-sm border border-white/15"></div>

          {/* Medical Cross Icons Scattered */}
          <div className="absolute top-1/4 right-1/4 w-8 h-8 opacity-15">
            <div className="w-full h-1 bg-white rounded absolute top-1/2 transform -translate-y-1/2"></div>
            <div className="h-full w-1 bg-white rounded absolute left-1/2 transform -translate-x-1/2"></div>
          </div>
          <div className="absolute bottom-1/3 left-1/4 w-6 h-6 opacity-10">
            <div className="w-full h-1 bg-white rounded absolute top-1/2 transform -translate-y-1/2"></div>
            <div className="h-full w-1 bg-white rounded absolute left-1/2 transform -translate-x-1/2"></div>
          </div>

          {/* Subtle Dot Pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white w-full">
          <div className="text-center max-w-lg">
            {/* Enhanced Icon/Logo Section */}
            <div className="mb-8">
              <div className="relative mx-auto w-24 h-24 mb-6">
                {/* Glass morphism container */}
                <div className="absolute inset-0 bg-white/15 rounded-3xl backdrop-blur-lg border border-white/20 shadow-2xl"></div>
                <div className="absolute inset-3 flex items-center justify-center">
                  <svg
                    viewBox="0 0 60 60"
                    className="w-full h-full text-white drop-shadow-lg"
                  >
                    <rect
                      x="7"
                      y="27"
                      width="46"
                      height="6"
                      rx="3"
                      fill="currentColor"
                    />
                    <rect
                      x="27"
                      y="7"
                      width="6"
                      height="46"
                      rx="3"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl"></div>
              </div>
            </div>

            {/* Main Heading with Beautiful Typography */}
            <h1 className="text-4xl lg:text-6xl font-black mb-6 leading-tight tracking-tight">
              <span className="block bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Join AlertX
              </span>
              <span className="block bg-gradient-to-r from-blue-50 via-white to-indigo-50 bg-clip-text text-transparent drop-shadow-2xl mt-1">
                Network
              </span>
            </h1>

            {/* Elegant Subtitle */}
            <p className="text-lg lg:text-xl font-medium text-blue-50/90 mb-8 leading-relaxed tracking-wide max-w-md mx-auto">
              Register your hospital and become part of the most advanced
              emergency response system
            </p>

            {/* Enhanced Step Indicator */}
            <div className="flex justify-center space-x-4 mt-8 mb-8">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`relative transition-all duration-500 ${
                    step <= currentStep ? "scale-110" : "scale-100"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      step <= currentStep
                        ? "bg-white shadow-lg shadow-white/30"
                        : "bg-white/20 backdrop-blur-sm border border-white/30"
                    }`}
                  ></div>
                  {step <= currentStep && (
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-3 gap-6 opacity-80">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">24/7</span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  Emergency Ready
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">AI</span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  Smart System
                </p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <span className="text-sm font-bold">+</span>
                </div>
                <p className="text-xs text-blue-100 font-medium">
                  Healthcare Plus
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-3/5 bg-gradient-to-br from-white via-slate-50 to-gray-50 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-8">
          <div className="w-full max-w-2xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}

                <div className="ml-auto">
                  {currentStep < 6 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep(currentStep)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white rounded-lg hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !validateStep(4)}
                      className="px-8 py-3 bg-gradient-to-r from-blue-400/90 to-indigo-500/90 text-white rounded-lg hover:from-blue-500/90 hover:to-indigo-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Registering...
                        </div>
                      ) : (
                        "Submit Registration"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already registered?{" "}
                <Link
                  to="/auth/signin"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

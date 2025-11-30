import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, CaretRight, Users, User } from "phosphor-react";
import React, { useState, useEffect, useCallback } from "react";

import { IncomingPatientCard } from "./IncomingPatientCard";

/**
 * Enhanced Patient Navigation Component
 * Provides full-width patient display with carousel navigation for handling multiple patients
 */
export const PatientNavigationCarousel = ({
  patients = [],
  ambulances = [],
  hospital = null,
  onAccept,
  onPrepare,
  onCallParamedic,
  onViewTracking,
  autoAdvanceInterval = null,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Helper to find ambulance for current patient
  const getCurrentAmbulance = (patient) => {
    if (!patient || !ambulances) return null;
    return ambulances.find(
      amb => amb.id === patient.ambulanceId || 
             amb.assignedEmergencyId === patient.id ||
             amb.assignedEmergency === patient.id
    );
  };

  // Navigation functions - MUST be declared before useEffect hooks that depend on them
  const goToNext = useCallback(() => {
    if (patients.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % patients.length);
  }, [patients.length]);

  const goToPrevious = useCallback(() => {
    if (patients.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + patients.length) % patients.length);
  }, [patients.length]);

  const goToPatient = useCallback(
    (index) => {
      if (index === currentIndex || index < 0 || index >= patients.length)
        return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex, patients.length]
  );

  // Debug logging
  useEffect(() => {
    console.log("PatientNavigationCarousel mounted/updated:", {
      patientsCount: patients?.length || 0,
      currentIndex,
      hasOnAccept: typeof onAccept === "function",
      hasOnPrepare: typeof onPrepare === "function",
      hasOnCallParamedic: typeof onCallParamedic === "function",
      firstPatient: patients?.[0],
    });
  }, [patients, currentIndex, onAccept, onPrepare, onCallParamedic]);

  // Reset to first patient when patients list changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [patients.length]);

  // Auto-advance functionality (optional)
  useEffect(() => {
    if (autoAdvanceInterval && patients.length > 1) {
      const interval = setInterval(() => {
        goToNext();
      }, autoAdvanceInterval);

      return () => clearInterval(interval);
    }
  }, [currentIndex, patients.length, autoAdvanceInterval, goToNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (patients.length <= 1) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
        case "Home":
          e.preventDefault();
          goToPatient(0);
          break;
        case "End":
          e.preventDefault();
          goToPatient(patients.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [patients.length, currentIndex, goToNext, goToPrevious, goToPatient]);

  // Get priority color for indicators
  const getPriorityColor = (patient) => {
    const priority = patient.priority || patient.emergencyType;
    switch (priority?.toLowerCase()) {
      case "critical":
      case "red":
        return "bg-red-500";
      case "urgent":
      case "yellow":
        return "bg-yellow-500";
      case "high":
      case "orange":
        return "bg-orange-500";
      default:
        return "bg-blue-500";
    }
  };

  // Animation variants for patient cards
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
    }),
  };

  // Transition configuration
  const pageTransition = {
    x: { type: "spring", stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 },
    scale: { duration: 0.2 },
  };

  // Get current patient safely
  const currentPatient = patients[currentIndex];

  // Safety checks - MUST be after all hooks
  if (!patients || !Array.isArray(patients) || patients.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={40} className="text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">All Clear</h3>
        <p className="text-slate-500 mb-1">
          No incoming patients at the moment
        </p>
        <p className="text-slate-400 text-sm">
          Ready to receive emergency patients
        </p>
      </div>
    );
  }

  // Safety check for currentPatient
  if (patients.length > 0 && !currentPatient) {
    console.error("PatientNavigationCarousel: currentPatient is undefined", {
      currentIndex,
      patientsLength: patients.length,
    });
    setCurrentIndex(0);
    return null;
  }

  return (
    <section
      className="relative w-full"
      aria-label="Patient navigation carousel"
    >
      <div role="group" aria-label="Patient carousel controls">
        {/* Navigation Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Users size={20} />
              <span className="font-medium">Incoming Patients</span>
              <span className="text-sm bg-slate-100 px-2 py-1 rounded-full">
                {currentIndex + 1} of {patients.length}
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          {patients.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                disabled={patients.length <= 1}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous patient"
              >
                <CaretLeft size={16} />
              </button>
              <button
                onClick={goToNext}
                disabled={patients.length <= 1}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next patient"
              >
                <CaretRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Patient Card Container */}
        <div className="relative min-h-[250px] overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
              className="w-full"
            >
              <IncomingPatientCard
                patient={currentPatient}
                ambulance={getCurrentAmbulance(currentPatient)}
                hospital={hospital}
                onAccept={onAccept}
                onPrepare={onPrepare}
                onCallParamedic={onCallParamedic}
                onViewTracking={onViewTracking}
                isFullWidth={true}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination Dots */}
        {patients.length > 1 && (
          <div
            className="flex justify-center items-center gap-2 mt-6"
            role="tablist"
            aria-label="Patient navigation"
          >
            {patients.map((patient, index) => (
              <button
                key={patient.id || index}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to patient ${index + 1}`}
                onClick={() => goToPatient(index)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200 hover:scale-110
                  ${
                    index === currentIndex
                      ? `${getPriorityColor(patient)} shadow-md scale-110`
                      : "bg-slate-300 hover:bg-slate-400"
                  }
                `}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Navigation, Clock, Users } from "lucide-react";
import {
  useMapsState,
  useMapsDispatch,
  MAPS_ACTIONS,
} from "../context/MapsContext";

const Sidebar = () => {
  const { sidebarOpen, selectedEntity } = useMapsState();
  const dispatch = useMapsDispatch();

  const handleClose = () => {
    dispatch({ type: MAPS_ACTIONS.SET_SIDEBAR_OPEN, payload: false });
    dispatch({ type: MAPS_ACTIONS.SELECT_ENTITY, payload: null });
  };

  // Mock ambulance data based on selected entity
  const ambulanceData =
    selectedEntity?.type === "ambulance"
      ? {
          id: selectedEntity.id || "AMB-221",
          status: selectedEntity.status || "On Route",
          eta: selectedEntity.eta || 15,
          lastUpdated: "1 min ago",
          route: {
            from: "Yurila Illienka St, 42",
            to: "Yurkivska St, 2-6/32",
            progress: 65, // percentage
          },
          crew: [
            {
              name: "Lincoln Dokidis",
              role: "Paramedic",
              avatar:
                "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&h=40&fit=crop&crop=face",
            },
            {
              name: "Erin Vaccaro",
              role: "Nurse",
              avatar:
                "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face",
            },
            {
              name: "Justin Press",
              role: "Driver",
              phone: "+1 (555) 123-4567",
              avatar:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
            },
          ],
          dispatchedAt: "Thu, 1 Dec",
          ambulanceType: "Advanced Life Support",
        }
      : null;

  const getStatusColor = (status) => {
    switch (status) {
      case "On Route":
        return "bg-green-500";
      case "Idle":
        return "bg-yellow-500";
      case "Busy":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const sidebarVariants = {
    hidden: {
      x: "120%",
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.5,
      },
    },
  };

  return createPortal(
    <AnimatePresence>
      {sidebarOpen && ambulanceData && (
        <>
          {/* Full Screen Backdrop - Darken without blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999998,
            }}
            onClick={handleClose}
          />

          {/* Sidebar - Highest possible z-index, positioned on RIGHT */}
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed w-96 overflow-y-auto"
            style={{
              position: "fixed",
              top: "1rem",
              right: "1rem",
              bottom: "1rem",
              left: "auto",
              zIndex: 999999,
              width: "400px",
              marginLeft: "auto",
            }}
          >
            {/* Glassmorphism Container */}
            <div className="h-full rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl">
              {/* Header Section */}
              <div className="border-b border-white/10 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={handleClose}
                    className="rounded-lg p-2 transition-colors duration-200 hover:bg-white/10"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </button>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                    <span className="text-sm text-gray-300">
                      Ambulance Nearby
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <h1 className="text-xl font-semibold text-white">
                    Ambulance
                  </h1>
                  <p className="text-sm text-gray-400">
                    ID: {ambulanceData.id}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(ambulanceData.status)}`}
                    ></div>
                    <span className="text-sm text-white">
                      {ambulanceData.status}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Last update {ambulanceData.lastUpdated}
                  </span>
                </div>
              </div>

              {/* Route Section */}
              <div className="border-b border-white/10 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white">Route</h3>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      ETA {ambulanceData.eta} min
                    </span>
                  </div>
                </div>

                {/* Route Progress Bar */}
                <div className="relative mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <div className="relative mx-3 flex-1">
                      <div className="h-0.5 rounded-full bg-gray-600">
                        <motion.div
                          className="relative h-full rounded-full bg-green-500"
                          initial={{ width: "0%" }}
                          animate={{
                            width: `${ambulanceData.route.progress}%`,
                          }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                        >
                          <motion.div
                            className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [1, 0.7, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                      <Navigation className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>

                {/* Route Details */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    {ambulanceData.route.from}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <div className="mr-2 h-0.5 w-4 bg-gray-500"></div>
                    <span>to</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {ambulanceData.route.to}
                  </div>
                </div>
              </div>

              {/* Crew Section */}
              <div className="border-b border-white/10 p-6">
                <h3 className="mb-4 flex items-center text-sm font-medium text-white">
                  <Users className="mr-2 h-4 w-4" />
                  Crew
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {ambulanceData.crew.map((member, index) => (
                    <div key={index} className="text-center">
                      <div className="mx-auto mb-2 h-12 w-12 overflow-hidden rounded-full bg-gray-700">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=374151&color=fff&size=48`;
                          }}
                        />
                      </div>
                      <div className="text-xs font-medium text-white">
                        {member.name}
                      </div>
                      <div className="text-xs text-gray-400">{member.role}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trip Metadata */}
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Dispatched</span>
                    <span className="text-sm text-white">
                      {ambulanceData.dispatchedAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Type</span>
                    <span className="text-sm text-white">
                      {ambulanceData.ambulanceType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Priority</span>
                    <span className="text-sm text-red-400">Emergency</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6">
                  <div className="mb-3 text-sm font-medium text-white">
                    Quick Actions
                  </div>
                  <button className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm text-white transition-colors hover:bg-blue-700">
                    <div className="flex items-center justify-center space-x-2">
                      <span>📞</span>
                      <span>Contact Crew</span>
                    </div>
                    <div className="mt-1 text-xs text-blue-200">
                      Driver:{" "}
                      {ambulanceData.crew.find(
                        (member) => member.role === "Driver",
                      )?.phone || "+1 (555) 123-4567"}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Sidebar;

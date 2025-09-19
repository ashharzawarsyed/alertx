import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Mock API functions - replace with actual API calls
const fetchPatients = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    patients: [
      {
        id: "P001",
        firstName: "John",
        lastName: "Smith",
        age: 45,
        gender: "Male",
        phone: "+1 (555) 123-4567",
        email: "john.smith@email.com",
        address: "123 Main St, New York, NY",
        bloodType: "O+",
        allergies: ["Penicillin"],
        medicalConditions: ["Hypertension"],
        emergencyContact: {
          name: "Jane Smith",
          relationship: "Spouse",
          phone: "+1 (555) 123-4568"
        },
        insurance: {
          provider: "Blue Cross Blue Shield",
          policyNumber: "BC123456789"
        },
        currentStatus: "stable",
        assignedHospital: "City General Hospital",
        lastVisit: "2024-09-15",
        registrationDate: "2023-05-20"
      },
      {
        id: "P002",
        firstName: "Sarah",
        lastName: "Johnson",
        age: 32,
        gender: "Female",
        phone: "+1 (555) 234-5678",
        email: "sarah.johnson@email.com",
        address: "456 Oak Ave, Brooklyn, NY",
        bloodType: "A+",
        allergies: ["Shellfish"],
        medicalConditions: ["Asthma"],
        emergencyContact: {
          name: "Michael Johnson",
          relationship: "Husband",
          phone: "+1 (555) 234-5679"
        },
        insurance: {
          provider: "Aetna",
          policyNumber: "AE789012345"
        },
        currentStatus: "monitoring",
        assignedHospital: "Metro Medical Center",
        lastVisit: "2024-09-18",
        registrationDate: "2023-08-10"
      },
      {
        id: "P003",
        firstName: "Robert",
        lastName: "Wilson",
        age: 67,
        gender: "Male",
        phone: "+1 (555) 345-6789",
        email: "robert.wilson@email.com",
        address: "789 Pine St, Manhattan, NY",
        bloodType: "B-",
        allergies: ["None"],
        medicalConditions: ["Heart Disease", "Diabetes"],
        emergencyContact: {
          name: "Mary Wilson",
          relationship: "Wife",
          phone: "+1 (555) 345-6790"
        },
        insurance: {
          provider: "Medicare",
          policyNumber: "MC456789012"
        },
        currentStatus: "critical",
        assignedHospital: "Presbyterian Hospital",
        lastVisit: "2024-09-19",
        registrationDate: "2022-03-15"
      },
      {
        id: "P004",
        firstName: "Emily",
        lastName: "Davis",
        age: 28,
        gender: "Female",
        phone: "+1 (555) 456-7890",
        email: "emily.davis@email.com",
        address: "321 Elm St, Queens, NY",
        bloodType: "AB+",
        allergies: ["Latex"],
        medicalConditions: ["None"],
        emergencyContact: {
          name: "David Davis",
          relationship: "Brother",
          phone: "+1 (555) 456-7891"
        },
        insurance: {
          provider: "Cigna",
          policyNumber: "CG123456789"
        },
        currentStatus: "stable",
        assignedHospital: "Queens General",
        lastVisit: "2024-08-30",
        registrationDate: "2024-01-12"
      },
      {
        id: "P005",
        firstName: "Michael",
        lastName: "Brown",
        age: 55,
        gender: "Male",
        phone: "+1 (555) 567-8901",
        email: "michael.brown@email.com",
        address: "654 Maple Dr, Bronx, NY",
        bloodType: "O-",
        allergies: ["Iodine"],
        medicalConditions: ["High Cholesterol"],
        emergencyContact: {
          name: "Lisa Brown",
          relationship: "Wife",
          phone: "+1 (555) 567-8902"
        },
        insurance: {
          provider: "UnitedHealthcare",
          policyNumber: "UH987654321"
        },
        currentStatus: "stable",
        assignedHospital: "Bronx Medical",
        lastVisit: "2024-09-10",
        registrationDate: "2023-11-05"
      },
      {
        id: "P006",
        firstName: "Lisa",
        lastName: "Anderson",
        age: 41,
        gender: "Female",
        phone: "+1 (555) 678-9012",
        email: "lisa.anderson@email.com",
        address: "987 Cedar Ln, Staten Island, NY",
        bloodType: "A-",
        allergies: ["Sulfa drugs"],
        medicalConditions: ["Migraine"],
        emergencyContact: {
          name: "James Anderson",
          relationship: "Husband",
          phone: "+1 (555) 678-9013"
        },
        insurance: {
          provider: "Humana",
          policyNumber: "HM567890123"
        },
        currentStatus: "monitoring",
        assignedHospital: "Staten Island Hospital",
        lastVisit: "2024-09-12",
        registrationDate: "2023-07-20"
      }
    ],
    stats: {
      totalPatients: 6,
      activeEmergencies: 1,
      criticalCases: 1,
      recentAdmissions: 3
    }
  };
};

const createPatientAPI = async (patientData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { ...patientData, id: `P${Date.now()}` };
};

const updatePatientAPI = async ({ id, data }) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { ...data, id };
};

const deletePatientAPI = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return id;
};

// Custom hook for patient management
export const usePatients = () => {
  const queryClient = useQueryClient();

  // Fetch patients
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create patient mutation
  const createPatient = useMutation({
    mutationFn: createPatientAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  // Update patient mutation
  const updatePatient = useMutation({
    mutationFn: updatePatientAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  // Delete patient mutation
  const deletePatient = useMutation({
    mutationFn: deletePatientAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  return {
    patients: data?.patients || [],
    stats: data?.stats || {
      totalPatients: 0,
      activeEmergencies: 0,
      criticalCases: 0,
      recentAdmissions: 0
    },
    isLoading,
    error,
    refetch,
    createPatient,
    updatePatient,
    deletePatient,
  };
};
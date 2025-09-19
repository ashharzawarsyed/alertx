import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

const fetchPatient = async (id) => {
  const { data } = await api.get(`/api/v1/users/${id}`);
  return data.data;
};


export default function PatientDetailsPage() {
  const { id } = useParams();
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => fetchPatient(id),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-center">Loading patient...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error loading patient.</div>;
  if (!patient) return <div className="p-8 text-center">Patient not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold text-blue-700 mb-2">{patient.name}</h1>
      <div className="mb-2 text-gray-700">Email: {patient.email}</div>
      <div className="mb-2 text-gray-700">Phone: {patient.phone}</div>
      <div className="mb-2 text-gray-700">Role: {patient.role}</div>
      {/* Add more patient details as needed */}
    </div>
  );
}

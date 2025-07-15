import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import BookingWizard from "./BookingWizard";
import ClientLayout from "../../layouts/ClientLayout";
import clientService from "../../../services/clientService";

const QuoteAcceptanceBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(2); // Start at date/time selection

    const { quote, service, provider } = location.state || {};

    if (!quote || !service || !provider) {
        // Redirect if no quote data
        navigate("/client/quotes");
        return null;
    }

    // Ensure service object has all required fields
    const serviceData = {
        id: service.id || quote.service_id, // Fallback to quote service_id
        title: service.title || quote.service_title,
        description: service.description || quote.service_description,
        price: service.price || quote.quoted_price,
        base_price: service.base_price || quote.quoted_price,
        duration_hours: service.duration_hours || quote.estimated_duration || 1,
        category: service.category ||
            quote.service_category || {
                name: "Service",
                color: "primary",
                icon: "fas fa-cog",
            },
        first_image_url: service.first_image_url || quote.service_image,
        pricing_type: service.pricing_type || "fixed",
    };

    // Use real provider data from quote
    const providerData = {
        id: provider.id || quote.provider_id,
        name: provider.name || quote.provider_name,
        business_name: provider.business_name || quote.provider_business_name,
        profile_image_url: provider.profile_image_url || quote.provider_image,
        bio:
            provider.bio ||
            quote.provider_bio ||
            "Professional service provider",
        is_verified: provider.is_verified || quote.provider_verified || false,
        average_rating: provider.average_rating || quote.provider_rating || 0,
        reviews_count: provider.reviews_count || quote.provider_reviews || 0,
    };

    console.log("Enhanced service data:", serviceData);
    console.log("Enhanced provider data:", providerData);

    // Ensure we have the service ID
    if (!serviceData.id) {
        console.error("Cannot proceed without service ID");
        return (
            <ClientLayout>
                <div className="alert alert-danger">
                    <h4>Error</h4>
                    <p>Service information is incomplete. Please try again.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("/client/quotes")}
                    >
                        Back to Quotes
                    </button>
                </div>
            </ClientLayout>
        );
    }

    const handleBookingComplete = async (bookingData) => {
        console.log("Complete booking data received:", bookingData);

        // Check if we have a successful booking (indicated by type and appointment)
        if (bookingData.type === "appointment" && bookingData.appointment) {
            // Appointment was created successfully
            navigate("/client/appointments", {
                state: {
                    message:
                        "Quote accepted and appointment created successfully!",
                    appointment: bookingData.appointment,
                },
            });
            return;
        }

        if (bookingData.type === "quote_acceptance" && bookingData.data) {
            // Quote acceptance was successful
            navigate("/client/appointments", {
                state: {
                    message:
                        "Quote accepted and appointment created successfully!",
                    appointment: bookingData.data.appointment,
                },
            });
            return;
        }

        // If we get here, something went wrong
        console.error("Booking failed or incomplete:", bookingData);
        alert("Failed to create appointment. Please try again.");
    };

    // const handleBookingComplete = async (bookingData) => {
    //     console.log("Complete booking data received:", bookingData);

    //     // Check if the booking was already completed successfully
    //     if (bookingData.type === "appointment" && bookingData.appointment) {
    //         // The booking was successful, navigate to success page
    //         navigate("/client/appointments", {
    //             state: {
    //                 message:
    //                     "Quote accepted and appointment created successfully!",
    //                 appointment: bookingData.appointment,
    //             },
    //         });
    //         return;
    //     }

    //     // If we get here, something went wrong or it's not a completed booking
    //     // This is the fallback for when we need to manually create the appointment
    //     try {
    //         console.log("Attempting manual appointment creation...");

    //         // Map the fields properly - check what BookingWizard actually sends
    //         const appointmentData = {
    //             appointment_date:
    //                 bookingData.appointment_date || bookingData.date,
    //             appointment_time:
    //                 bookingData.appointment_time || bookingData.time,
    //             duration_hours:
    //                 parseFloat(
    //                     bookingData.duration_hours || bookingData.duration
    //                 ) || 1,
    //             client_phone:
    //                 bookingData.client_phone || bookingData.phone || "",
    //             client_email:
    //                 bookingData.client_email || bookingData.email || "",
    //             client_address: bookingData.client_address || "",
    //             client_city: bookingData.client_city || "",
    //             client_postal_code: bookingData.client_postal_code || "",
    //             location_instructions: bookingData.location_instructions || "",
    //             client_notes: bookingData.client_notes || "",
    //             contact_preference: bookingData.contact_preference || "phone",
    //             emergency_contact: bookingData.emergency_contact || "",
    //             payment_method: bookingData.payment_method || "cash",
    //             agreed_to_terms: bookingData.agreed_to_terms || true,
    //             location_type: bookingData.location_type || "client_address",
    //         };

    //         console.log("Mapped appointment data:", appointmentData);

    //         // Validate required fields
    //         if (!appointmentData.appointment_date) {
    //             console.error(
    //                 "Missing appointment_date. Raw booking data:",
    //                 bookingData
    //             );
    //             alert("Please select an appointment date.");
    //             return;
    //         }

    //         if (!appointmentData.appointment_time) {
    //             console.error(
    //                 "Missing appointment_time. Raw booking data:",
    //                 bookingData
    //             );
    //             alert("Please select an appointment time.");
    //             return;
    //         }

    //         const response = await axios.post(
    //             `/api/client/quotes/${quote.id}/create-appointment`,
    //             appointmentData
    //         );

    //         if (response.data.success) {
    //             navigate("/client/appointments", {
    //                 state: {
    //                     message:
    //                         "Quote accepted and appointment created successfully!",
    //                     appointment: response.data.data.appointment,
    //                 },
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Failed to accept quote:", error);

    //         if (error.response) {
    //             console.error("Error status:", error.response.status);
    //             console.error("Error data:", error.response.data);

    //             if (error.response.status === 422) {
    //                 console.error(
    //                     "Validation errors:",
    //                     error.response.data.errors
    //                 );
    //                 alert("Please check your input and try again.");
    //             } else {
    //                 alert("Failed to accept quote. Please try again.");
    //             }
    //         }
    //     }
    // };

    // const handleBookingComplete = async (bookingData) => {
    //     try {
    //         console.log("Complete booking data received:", bookingData);

    //         // Map the fields properly - check what BookingWizard actually sends
    //         const appointmentData = {
    //             appointment_date:
    //                 bookingData.appointment_date || bookingData.date,
    //             appointment_time:
    //                 bookingData.appointment_time || bookingData.time,
    //             duration_hours:
    //                 parseFloat(
    //                     bookingData.duration_hours || bookingData.duration
    //                 ) || 1,
    //             client_phone:
    //                 bookingData.client_phone || bookingData.phone || "",
    //             client_email:
    //                 bookingData.client_email || bookingData.email || "",
    //             client_address: bookingData.client_address || "",
    //             client_city: bookingData.client_city || "",
    //             client_postal_code: bookingData.client_postal_code || "",
    //             location_instructions: bookingData.location_instructions || "",
    //             client_notes: bookingData.client_notes || "",
    //             contact_preference: bookingData.contact_preference || "phone",
    //             emergency_contact: bookingData.emergency_contact || "",
    //             payment_method: bookingData.payment_method || "cash",
    //             agreed_to_terms: bookingData.agreed_to_terms || true,
    //             location_type: bookingData.location_type || "client_address",
    //         };

    //         console.log("Mapped appointment data:", appointmentData);

    //         // Validate required fields
    //         if (!appointmentData.appointment_date) {
    //             console.error(
    //                 "Missing appointment_date. Raw booking data:",
    //                 bookingData
    //             );
    //             alert("Please select an appointment date.");
    //             return;
    //         }

    //         if (!appointmentData.appointment_time) {
    //             console.error(
    //                 "Missing appointment_time. Raw booking data:",
    //                 bookingData
    //             );
    //             alert("Please select an appointment time.");
    //             return;
    //         }

    //         const response = await axios.post(
    //             `/api/client/quotes/${quote.id}/create-appointment`,
    //             appointmentData
    //         );

    //         if (response.data.success) {
    //             navigate("/client/appointments", {
    //                 state: {
    //                     message:
    //                         "Quote accepted and appointment created successfully!",
    //                     appointment: response.data.data.appointment,
    //                 },
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Failed to accept quote:", error);

    //         if (error.response) {
    //             console.error("Error status:", error.response.status);
    //             console.error("Error data:", error.response.data);

    //             if (error.response.status === 422) {
    //                 console.error(
    //                     "Validation errors:",
    //                     error.response.data.errors
    //                 );
    //                 alert("Please check your input and try again.");
    //             } else {
    //                 alert("Failed to accept quote. Please try again.");
    //             }
    //         }
    //     }
    // };

    // const handleBookingComplete = async (bookingData) => {
    //     try {
    //         console.log("Quote acceptance booking data:", bookingData);

    //         // Create appointment from quote using the quote-specific endpoint
    //         const response = await axios.post(
    //             `/api/client/quotes/${quote.id}/create-appointment`,
    //             {
    //                 appointment_date: bookingData.appointment_date,
    //                 appointment_time: bookingData.appointment_time,
    //                 duration_hours: parseFloat(bookingData.duration_hours) || 1,
    //                 client_phone: bookingData.client_phone || "",
    //                 client_email: bookingData.client_email || "",
    //                 client_address: bookingData.client_address || "",
    //                 client_city: bookingData.client_city || "",
    //                 client_postal_code: bookingData.client_postal_code || "",
    //                 location_instructions:
    //                     bookingData.location_instructions || "",
    //                 client_notes: bookingData.client_notes || "",
    //                 contact_preference:
    //                     bookingData.contact_preference || "phone",
    //                 emergency_contact: bookingData.emergency_contact || "",
    //                 payment_method: bookingData.payment_method || "cash",
    //                 agreed_to_terms: bookingData.agreed_to_terms || true,
    //                 location_type:
    //                     bookingData.location_type || "client_address",
    //             }
    //         );

    //         if (response.data.success) {
    //             navigate("/client/appointments", {
    //                 state: {
    //                     message:
    //                         "Quote accepted and appointment created successfully!",
    //                     appointment: response.data.data.appointment,
    //                 },
    //             });
    //         } else {
    //             console.error("Quote acceptance failed:", response.data);
    //             // You might want to show an error message here
    //         }
    //     } catch (error) {
    //         console.error("Failed to accept quote:", error);
    //         if (error.response) {
    //             console.error("Error response:", error.response.data);
    //         }
    //         // Handle error - maybe show toast notification
    //     }
    // };

    // const handleBookingComplete = async (bookingData) => {
    //     try {
    //         console.log("Quote acceptance booking data:", bookingData);

    //         // Ensure service_id is present
    //         // if (!bookingData.service_id) {
    //         //     console.error("Service ID missing in booking data");
    //         //     return;
    //         // }

    //         const response = await axios.post(
    //             `/api/client/quotes/${quote.id}/create-appointment`,
    //             {
    //                 appointment_date:
    //                     bookingData.appointment_date || bookingData.date,
    //                 appointment_time:
    //                     bookingData.appointment_time || bookingData.time,
    //                 duration_hours: parseFloat(bookingData.duration_hours) || 1,
    //                 client_phone: bookingData.client_phone || "",
    //                 client_email: bookingData.client_email || "",
    //                 client_address: bookingData.client_address || "",
    //                 client_city: bookingData.client_city || "",
    //                 client_postal_code: bookingData.client_postal_code || "",
    //                 location_instructions:
    //                     bookingData.location_instructions || "",
    //                 client_notes: bookingData.client_notes || "",
    //                 contact_preference:
    //                     bookingData.contact_preference || "phone",
    //                 emergency_contact: bookingData.emergency_contact || "",
    //                 payment_method: bookingData.payment_method || "cash",
    //                 agreed_to_terms: bookingData.agreed_to_terms || true,
    //                 location_type:
    //                     bookingData.location_type || "client_address",
    //             }
    //         );

    //         if (response.data.success) {
    //             navigate("/client/appointments", {
    //                 state: {
    //                     message:
    //                         "Quote accepted and appointment created successfully!",
    //                     appointment: response.data.data.appointment,
    //                 },
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Failed to accept quote:", error);

    //         // Log detailed error information
    //         if (error.response) {
    //             console.error("Error status:", error.response.status);
    //             console.error("Error data:", error.response.data);

    //             // Show user-friendly error message
    //             if (error.response.status === 422) {
    //                 console.error(
    //                     "Validation errors:",
    //                     error.response.data.errors
    //                 );
    //                 alert("Please check your input and try again.");
    //             } else {
    //                 alert("Failed to accept quote. Please try again.");
    //             }
    //         }
    //     }
    // };

    // const handleBookingComplete = async (bookingData) => {
    //     try {
    //         console.log("Quote acceptance booking data:", bookingData);

    //         // Map the booking data fields to match backend expectations
    //         const appointmentData = {
    //             // Fix the field mapping - use the fields that BookingWizard actually sends
    //             appointment_date:
    //                 bookingData.appointment_date || bookingData.date,
    //             appointment_time:
    //                 bookingData.appointment_time || bookingData.time,
    //             duration_hours:
    //                 parseFloat(
    //                     bookingData.duration_hours || bookingData.duration
    //                 ) || 1,

    //             // Contact information
    //             client_phone:
    //                 bookingData.client_phone || bookingData.phone || "",
    //             client_email:
    //                 bookingData.client_email || bookingData.email || "",

    //             // Location information
    //             client_address:
    //                 bookingData.client_address || bookingData.address || "",
    //             client_city: bookingData.client_city || bookingData.city || "",
    //             client_postal_code:
    //                 bookingData.client_postal_code ||
    //                 bookingData.postal_code ||
    //                 "",
    //             location_instructions: bookingData.location_instructions || "",
    //             location_type: bookingData.location_type || "client_address",

    //             // Notes and preferences
    //             client_notes:
    //                 bookingData.client_notes || bookingData.requirements || "",
    //             contact_preference: bookingData.contact_preference || "phone",
    //             emergency_contact: bookingData.emergency_contact || "",

    //             // Payment and terms
    //             payment_method: bookingData.payment_method || "cash",
    //             agreed_to_terms: bookingData.agreed_to_terms || true,
    //         };

    //         console.log("Mapped appointment data:", appointmentData);

    //         // Validate required fields before sending
    //         if (!appointmentData.appointment_date) {
    //             console.error(
    //                 "Missing appointment_date in booking data:",
    //                 bookingData
    //             );
    //             alert("Please select an appointment date.");
    //             return;
    //         }

    //         if (!appointmentData.appointment_time) {
    //             console.error(
    //                 "Missing appointment_time in booking data:",
    //                 bookingData
    //             );
    //             alert("Please select an appointment time.");
    //             return;
    //         }

    //         const response = await axios.post(
    //             `/api/client/quotes/${quote.id}/create-appointment`,
    //             appointmentData
    //         );

    //         if (response.data.success) {
    //             navigate("/client/appointments", {
    //                 state: {
    //                     message:
    //                         "Quote accepted and appointment created successfully!",
    //                     appointment: response.data.data.appointment,
    //                 },
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Failed to accept quote:", error);

    //         // Log detailed error information
    //         if (error.response) {
    //             console.error("Error status:", error.response.status);
    //             console.error("Error data:", error.response.data);

    //             // Show user-friendly error message
    //             if (error.response.status === 422) {
    //                 console.error(
    //                     "Validation errors:",
    //                     error.response.data.errors
    //                 );
    //                 alert(
    //                     "Please check your input and try again:\n" +
    //                         Object.entries(error.response.data.errors)
    //                             .map(
    //                                 ([field, messages]) =>
    //                                     `${field}: ${messages.join(", ")}`
    //                             )
    //                             .join("\n")
    //                 );
    //             } else {
    //                 alert("Failed to accept quote. Please try again.");
    //             }
    //         }
    //     }
    // };

    // return (
    //     <ClientLayout>
    //         <div className="quote-acceptance-booking">
    //             <div className="mb-4">
    //                 <h2 className="fw-bold">
    //                     Accept Quote & Schedule Appointment
    //                 </h2>
    //                 <p className="text-muted">
    //                     Complete your booking for Quote #{quote.quote_number}
    //                 </p>
    //                 <div className="alert alert-info">
    //                     <strong>
    //                         Quote Total: Rs.{" "}
    //                         {parseFloat(quote.quoted_price) +
    //                             parseFloat(quote.travel_fee || 0)}
    //                     </strong>
    //                     {quote.travel_fee > 0 && (
    //                         <small className="d-block">
    //                             (Service: Rs. {quote.quoted_price} + Travel: Rs.{" "}
    //                             {quote.travel_fee})
    //                         </small>
    //                     )}
    //                 </div>
    //             </div>

    //             <BookingWizard
    //                 service={service}
    //                 provider={provider}
    //                 onComplete={handleBookingComplete}
    //                 currentStep={currentStep}
    //                 setCurrentStep={setCurrentStep}
    //                 initialData={{
    //                     // Pre-fill with quote data
    //                     service_id: service.id,
    //                     provider_id: provider.id,
    //                     total_price:
    //                         parseFloat(quote.quoted_price) +
    //                         parseFloat(quote.travel_fee || 0),
    //                     base_price: quote.quoted_price,
    //                     travel_fee: quote.travel_fee || 0,
    //                     duration: quote.estimated_duration || 1,
    //                     duration_hours: quote.estimated_duration || 1,
    //                     special_instructions: quote.special_requirements || "",

    //                     // Pre-fill location if available from quote
    //                     location: {
    //                         type: "client_address",
    //                         address: quote.address || "",
    //                         city: quote.city || "",
    //                     },

    //                     // From quote acceptance
    //                     isFromQuote: true,
    //                     quote_id: quote.id,
    //                     booking_source: "quote_acceptance",
    //                 }}
    //             />
    //         </div>
    //     </ClientLayout>
    // );

    // return (
    //     <ClientLayout>
    //         <div className="quote-acceptance-booking">
    //             <div className="mb-4">
    //                 <h2 className="fw-bold">
    //                     Accept Quote & Schedule Appointment
    //                 </h2>
    //                 <p className="text-muted">
    //                     Complete your booking for Quote #{quote.quote_number}
    //                 </p>
    //             </div>

    //             <BookingWizard
    //                 service={serviceData} // Use the enhanced service data
    //                 provider={provider}
    //                 onComplete={handleBookingComplete}
    //                 currentStep={currentStep}
    //                 setCurrentStep={setCurrentStep}
    //                 initialData={{
    //                     // Pre-fill with quote data
    //                     service_id: serviceData.id, // Explicitly set service_id
    //                     provider_id: provider.id,
    //                     total_price:
    //                         parseFloat(quote.quoted_price) +
    //                         parseFloat(quote.travel_fee || 0),
    //                     base_price: quote.quoted_price,
    //                     travel_fee: quote.travel_fee || 0,
    //                     duration: quote.estimated_duration || 1,
    //                     duration_hours: quote.estimated_duration || 1,
    //                     special_instructions: quote.special_requirements || "",
    //                     isFromQuote: true,
    //                     quote_id: quote.id,
    //                     booking_source: "quote_acceptance",
    //                 }}
    //             />
    //         </div>
    //     </ClientLayout>
    // );
    return (
        <ClientLayout>
            <div className="quote-acceptance-booking">
                <div className="mb-4">
                    <h2 className="fw-bold">
                        Accept Quote & Schedule Appointment
                    </h2>
                    <p className="text-muted">
                        Complete your booking for Quote #{quote.quote_number}
                    </p>
                </div>

                <BookingWizard
                    service={serviceData}
                    provider={providerData} // Use enhanced provider data
                    onComplete={handleBookingComplete}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    initialData={{
                        service_id: serviceData.id,
                        provider_id: providerData.id,
                        total_price:
                            parseFloat(quote.quoted_price) +
                            parseFloat(quote.travel_fee || 0),
                        base_price: quote.quoted_price,
                        travel_fee: quote.travel_fee || 0,
                        duration: quote.estimated_duration || 1,
                        duration_hours: quote.estimated_duration || 1,
                        special_instructions: quote.special_requirements || "",
                        isFromQuote: true,
                        quote_id: quote.id,
                        booking_source: "quote_acceptance",
                    }}
                />
            </div>
        </ClientLayout>
    );
};

export default QuoteAcceptanceBooking;

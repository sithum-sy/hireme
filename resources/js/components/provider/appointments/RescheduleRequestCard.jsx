import React, { useState } from 'react';

const RescheduleRequestCard = ({
  appointment,
  onApprove,
  onDecline,
  loading = false,
}) => {
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [declineLoading, setDeclineLoading] = useState(false);

  if (
    !appointment?.has_pending_reschedule ||
    !appointment?.pending_reschedule_request
  ) {
    return null;
  }

  const rescheduleRequest = appointment.pending_reschedule_request;

  // Helper functions for formatting
  const formatDate = dateString => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = timeString => {
    if (!timeString) return 'Time not available';
    try {
      // Handle both "HH:MM:SS" and "HH:MM" formats
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${displayHour}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch (error) {
      return timeString;
    }
  };

  const getRescheduleReasonText = reason => {
    const reasons = {
      personal_emergency: 'Personal Emergency',
      work_conflict: 'Work Schedule Conflict',
      travel_plans: 'Travel Plans Changed',
      health_reasons: 'Health Reasons',
      weather_concerns: 'Weather Concerns',
      provider_request: 'Provider Request',
      other: 'Other Reason',
    };
    return reasons[reason] || reason;
  };

  const handleApprove = async () => {
    if (loading || declineLoading) return;
    await onApprove();
  };

  const handleDeclineClick = () => {
    if (loading || declineLoading) return;
    setShowDeclineReason(true);
  };

  const handleDeclineConfirm = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining the reschedule request.');
      return;
    }

    setDeclineLoading(true);
    try {
      await onDecline(declineReason);
      setShowDeclineReason(false);
      setDeclineReason('');
    } catch (error) {
      console.error('Error declining reschedule:', error);
    } finally {
      setDeclineLoading(false);
    }
  };

  const handleDeclineCancel = () => {
    setShowDeclineReason(false);
    setDeclineReason('');
  };

  return (
    <div className='reschedule-request-wrapper'>
      {/* Header */}
      <div className='reschedule-header d-flex align-items-center mb-4 p-3 bg-light bg-opacity-10 rounded border border-warning'>
        <div className='reschedule-icon me-3'>
          <i className='fas fa-calendar-alt fa-2x text-warning'></i>
        </div>
        <div className='flex-grow-1'>
          <h5 className='fw-bold mb-1 text-warning'>
            <i className='fas fa-clock me-2'></i>
            Reschedule Request Pending
          </h5>
          <p className='mb-0 text-muted small'>
            Your client has requested to change the appointment time
          </p>
        </div>
      </div>

      {/* Date/Time Comparison - Mobile Responsive */}
      <div className='row g-3 mb-4'>
        {/* Current Appointment */}
        <div className='col-12 col-md-6'>
          <div className='comparison-card h-100 bg-light border rounded p-3'>
            <div className='d-flex align-items-center mb-2'>
              <i className='fas fa-calendar me-2 text-muted'></i>
              <h6 className='fw-semibold mb-0 text-muted'>
                Current Appointment
              </h6>
            </div>
            <div className='appointment-info'>
              <div className='info-row d-flex justify-content-between align-items-center mb-1'>
                <span className='text-muted small'>Date:</span>
                <span className='fw-medium'>
                  {formatDate(appointment.appointment_date)}
                </span>
              </div>
              <div className='info-row d-flex justify-content-between align-items-center'>
                <span className='text-muted small'>Time:</span>
                <span className='fw-medium'>
                  <i className='fas fa-clock me-1'></i>
                  {formatTime(appointment.appointment_time)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Requested Changes */}
        <div className='col-12 col-md-6'>
          <div className='comparison-card h-100 bg-primary bg-opacity-10 border border-primary rounded p-3'>
            <div className='d-flex align-items-center mb-2'>
              <i className='fas fa-calendar-check me-2 text-light'></i>
              <h6 className='fw-semibold mb-0 text-light'>
                Requested New Time
              </h6>
            </div>
            <div className='appointment-info'>
              <div className='info-row d-flex justify-content-between align-items-center mb-1'>
                <span className='text-light small'>New Date:</span>
                <span className='fw-bold text-light'>
                  {formatDate(rescheduleRequest.requested_date)}
                </span>
              </div>
              <div className='info-row d-flex justify-content-between align-items-center'>
                <span className='text-light small'>New Time:</span>
                <span className='fw-bold text-light'>
                  <i className='fas fa-clock me-1'></i>
                  {formatTime(rescheduleRequest.requested_time)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Details - Mobile Stack */}
      <div className='row g-3 mb-4'>
        <div className='col-12 col-md-6'>
          <div className='detail-section'>
            <h6 className='fw-semibold text-dark mb-2 d-flex align-items-center'>
              <i className='fas fa-question-circle me-2 text-info'></i>
              Reason:
            </h6>
            <span className='badge bg-info bg-opacity-20 text-info px-3 py-2'>
              {getRescheduleReasonText(rescheduleRequest.reason)}
            </span>
          </div>
        </div>
        <div className='col-12 col-md-6'>
          <div className='detail-section'>
            <h6 className='fw-semibold text-dark mb-2 d-flex align-items-center'>
              <i className='fas fa-clock me-2 text-secondary'></i>
              Requested:
            </h6>
            <div className='text-muted'>
              {new Date(rescheduleRequest.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      {rescheduleRequest.notes && (
        <div className='notes-section mb-4'>
          <h6 className='fw-semibold text-dark mb-2 d-flex align-items-center'>
            <i className='fas fa-comment-dots me-2 text-secondary'></i>
            Additional Notes from Client:
          </h6>
          <div className='notes-content bg-white rounded p-3 border-start border-primary border-3 border-start-4'>
            {/* <div className="notes-content bg-white rounded p-3 border border-start border-primary border-3 border-start-4"> */}
            <div className='position-relative'>
              <i
                className='fas fa-quote-left text-primary opacity-50 position-absolute'
                style={{ top: '0.25rem', left: '0' }}
              ></i>
              <div className='px-4 text-dark'>{rescheduleRequest.notes}</div>
              <i
                className='fas fa-quote-right text-primary opacity-50 position-absolute'
                style={{ bottom: '0.25rem', right: '0' }}
              ></i>
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Input */}
      {showDeclineReason && (
        <div className='decline-section mb-4'>
          <div className='card border-danger'>
            <div className='card-header bg-danger bg-opacity-10 border-bottom border-danger'>
              <h6 className='fw-semibold mb-0 text-danger d-flex align-items-center'>
                <i className='fas fa-times-circle me-2'></i>
                Please provide a reason for declining
              </h6>
            </div>
            <div className='card-body'>
              <textarea
                className='form-control border-danger'
                rows='3'
                placeholder='Explain why you cannot accommodate this reschedule request. This message will be sent to the client.'
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                maxLength='500'
                disabled={declineLoading}
              />
              <div className='d-flex justify-content-between mt-2'>
                <small className='text-muted'>
                  This explanation will be sent to your client
                </small>
                <small className='text-muted'>
                  {declineReason.length}/500 characters
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Mobile Stack */}
      <div className='action-section mb-4'>
        {!showDeclineReason ? (
          <div className='btn-group-responsive d-flex flex-column flex-sm-row gap-2 justify-content-end'>
            <button
              type='button'
              className='btn btn-outline-danger btn-responsive'
              onClick={handleDeclineClick}
              disabled={loading || declineLoading}
            >
              <i className='fas fa-times me-2'></i>
              Decline Request
            </button>
            <button
              type='button'
              className='btn btn-success btn-responsive'
              onClick={handleApprove}
              disabled={loading || declineLoading}
            >
              {loading ? (
                <>
                  <span
                    className='spinner-border spinner-border-sm me-2'
                    role='status'
                  ></span>
                  Approving...
                </>
              ) : (
                <>
                  <i className='fas fa-check me-2'></i>
                  Approve Reschedule
                </>
              )}
            </button>
          </div>
        ) : (
          <div className='btn-group-responsive d-flex flex-column flex-sm-row gap-2 justify-content-end'>
            <button
              type='button'
              className='btn btn-outline-secondary btn-responsive'
              onClick={handleDeclineCancel}
              disabled={declineLoading}
            >
              <i className='fas fa-arrow-left me-2'></i>
              Back
            </button>
            <button
              type='button'
              className='btn btn-danger btn-responsive'
              onClick={handleDeclineConfirm}
              disabled={declineLoading || !declineReason.trim()}
            >
              {declineLoading ? (
                <>
                  <span
                    className='spinner-border spinner-border-sm me-2'
                    role='status'
                  ></span>
                  Declining...
                </>
              ) : (
                <>
                  <i className='fas fa-times me-2'></i>
                  Confirm Decline
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Information Note */}
      <div className='info-note pt-3 border-top'>
        <div className='d-flex align-items-start'>
          <i className='fas fa-info-circle text-info me-2 mt-1'></i>
          <div className='small text-muted'>
            <strong className='d-block mb-1'>What happens next?</strong>
            <div className='row row-cols-1 row-cols-md-2 g-2'>
              <div className='col'>
                <strong>Approve:</strong> Appointment updated to new date/time,
                client notified
              </div>
              <div className='col'>
                <strong>Decline:</strong> Original appointment unchanged, client
                receives your explanation
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleRequestCard;

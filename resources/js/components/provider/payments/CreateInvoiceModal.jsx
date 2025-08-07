import React, { useState, useEffect } from 'react';
import invoiceService from '../../../services/invoiceService';
import notificationService from '../../../services/notificationService';

const CreateInvoiceModal = ({ appointment, isOpen, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    appointment_id: '',
    due_days: 7,
    notes: '',
    line_items: [],
    additional_charges: [],
    discounts: [],
    send_invoice: true,
    payment_method: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      setFormData({
        appointment_id: appointment.id,
        due_days: 7,
        notes: '',
        line_items: generateDefaultLineItems(appointment),
        additional_charges: [],
        discounts: [],
        send_invoice: true,
        payment_method: appointment.payment_method || null, // Use payment method from appointment
      });
      setLoading(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, appointment]);

  const generateDefaultLineItems = appointment => {
    const items = [];
    const totalPrice = parseFloat(appointment.total_price) || 0;
    const durationHours = parseFloat(appointment.duration_hours) || 1;

    // Calculate correct hourly rate: use base_price if available, otherwise calculate from total_price
    const hourlyRate = appointment.base_price
      ? parseFloat(appointment.base_price)
      : Math.round(totalPrice / durationHours);

    // For quote-based appointments, show as fixed price
    const isQuoteBased =
      appointment.booking_source === 'quote_acceptance' || appointment.quote_id;

    if (isQuoteBased) {
      items.push({
        description:
          appointment.service_title || 'Service (Quote-based Fixed Price)',
        quantity: 1,
        rate: totalPrice,
        amount: totalPrice,
      });
    } else {
      // Ensure the amount equals original total_price to prevent rounding errors
      items.push({
        description: appointment.service_title || 'Service',
        quantity: durationHours,
        rate: hourlyRate,
        amount: totalPrice, // Use original total_price to maintain accuracy
      });
    }

    return items;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // Let the parent handle the completion and invoice creation
      await onComplete(formData);
    } catch (error) {
      console.error('Error in completion flow:', error);
      notificationService.error(
        'Error completing service and creating invoice'
      );
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        {
          description: '',
          quantity: 1,
          rate: 0,
          amount: 0,
        },
      ],
    }));
  };

  const updateLineItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.line_items];
      newItems[index] = { ...newItems[index], [field]: value };

      if (field === 'quantity' || field === 'rate') {
        const quantity = parseFloat(newItems[index].quantity) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        newItems[index].amount = quantity * rate;
      }

      return { ...prev, line_items: newItems };
    });
  };

  const removeLineItem = index => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  // Additional Charges Management
  const addAdditionalCharge = () => {
    setFormData(prev => ({
      ...prev,
      additional_charges: [
        ...prev.additional_charges,
        {
          type: 'overtime',
          description: '',
          quantity: 1,
          rate: 0,
          amount: 0,
          reason: '',
          client_approved: false,
        },
      ],
    }));
  };

  const updateAdditionalCharge = (index, field, value) => {
    setFormData(prev => {
      const newCharges = [...prev.additional_charges];
      newCharges[index] = { ...newCharges[index], [field]: value };

      if (field === 'quantity' || field === 'rate') {
        const quantity = parseFloat(newCharges[index].quantity) || 0;
        const rate = parseFloat(newCharges[index].rate) || 0;
        newCharges[index].amount = quantity * rate;
      }

      return { ...prev, additional_charges: newCharges };
    });
  };

  const removeAdditionalCharge = index => {
    setFormData(prev => ({
      ...prev,
      additional_charges: prev.additional_charges.filter((_, i) => i !== index),
    }));
  };

  // Discounts Management
  const addDiscount = () => {
    setFormData(prev => ({
      ...prev,
      discounts: [
        ...prev.discounts,
        {
          type: 'percentage',
          description: '',
          rate: 0,
          amount: 0,
          reason: '',
        },
      ],
    }));
  };

  const updateDiscount = (index, field, value) => {
    setFormData(prev => {
      const newDiscounts = [...prev.discounts];
      newDiscounts[index] = { ...newDiscounts[index], [field]: value };

      if (field === 'rate' && newDiscounts[index].type === 'percentage') {
        const subtotal = calculateSubtotalOnly();
        const rate = parseFloat(newDiscounts[index].rate) || 0;
        newDiscounts[index].amount = subtotal * (rate / 100);
      }

      return { ...prev, discounts: newDiscounts };
    });
  };

  const removeDiscount = index => {
    setFormData(prev => ({
      ...prev,
      discounts: prev.discounts.filter((_, i) => i !== index),
    }));
  };

  // Enhanced calculation methods
  const calculateSubtotalOnly = () => {
    return formData.line_items.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
  };

  const calculateTotalAdditionalCharges = () => {
    return formData.additional_charges.reduce(
      (sum, charge) => sum + (parseFloat(charge.amount) || 0),
      0
    );
  };

  const calculateTotalDiscounts = () => {
    return formData.discounts.reduce(
      (sum, discount) => sum + (parseFloat(discount.amount) || 0),
      0
    );
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotalOnly();
    const additionalCharges = calculateTotalAdditionalCharges();
    const discounts = calculateTotalDiscounts();

    return Math.max(0, subtotal + additionalCharges - discounts);
  };

  const handleClose = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!loading) {
      onClose();
    }
  };

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  const handleModalContentClick = e => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      className='modal-overlay modal-responsive'
      onClick={handleBackdropClick}
    >
      <div
        className='modal-content bg-white rounded-lg shadow-xl'
        onClick={handleModalContentClick}
      >
        <div className='modal-header border-bottom p-4'>
          <h5 className='modal-title mb-0 font-semibold text-lg'>
            <i className='fas fa-file-invoice me-2'></i>
            Create Invoice
          </h5>
          <button
            type='button'
            className='btn-close'
            onClick={handleClose}
            disabled={loading}
          >
            &times;
          </button>
        </div>

        {/* Appointment Info */}
        {appointment && (
          <div className='alert alert-info border-0 shadow-sm m-4 mb-0'>
            <div className='d-flex align-items-center mb-2'>
              <i className='fas fa-info-circle me-2'></i>
              <h6 className='mb-0 fw-bold'>Appointment Details</h6>
            </div>
            <div className='row g-3'>
              <div className='col-md-3'>
                <small className='text-muted'>Client:</small>
                <div className='fw-medium'>{appointment.client_name}</div>
              </div>
              <div className='col-md-3'>
                <small className='text-muted'>Service:</small>
                <div className='fw-medium'>{appointment.service_title}</div>
              </div>
              <div className='col-md-2'>
                <small className='text-muted'>Date:</small>
                <div className='fw-medium'>
                  {new Date(appointment.appointment_date).toLocaleDateString()}
                </div>
              </div>
              <div className='col-md-2'>
                <small className='text-muted'>Time:</small>
                <div className='fw-medium'>
                  {appointment.appointment_time || 'Not set'}
                </div>
              </div>
              <div className='col-md-2'>
                <small className='text-muted'>Payment Method:</small>
                <div className='fw-medium'>
                  <i
                    className={`fas ${
                      appointment.payment_method === 'cash'
                        ? 'fa-money-bill-wave'
                        : 'fa-credit-card'
                    } me-1`}
                  ></i>
                  {appointment.payment_method === 'cash'
                    ? 'Cash'
                    : appointment.payment_method === 'card'
                      ? 'Card'
                      : appointment.payment_method || 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='modal-body p-4'>
            {/* Basic Info */}
            <div className='row g-3 mb-4'>
              <div className='col-md-4'>
                <label className='form-label'>
                  <i className='fas fa-calendar me-1'></i>
                  Due in (days)
                </label>
                <input
                  type='number'
                  className='form-control'
                  min='0'
                  max='30'
                  value={formData.due_days}
                  onChange={e =>
                    handleChange('due_days', parseInt(e.target.value))
                  }
                  disabled={loading}
                />
              </div>
              <div className='col-md-8'>
                <div className='form-check mt-4'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    id='sendInvoice'
                    checked={formData.send_invoice}
                    onChange={e =>
                      handleChange('send_invoice', e.target.checked)
                    }
                    disabled={loading}
                  />
                  <label className='form-check-label' htmlFor='sendInvoice'>
                    <i className='fas fa-paper-plane me-1'></i>
                    Send invoice to client immediately
                    <small className='d-block text-muted'>
                      If unchecked, invoice will be saved as draft for review
                    </small>
                  </label>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className='mb-4'>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h5 className='mb-0'>
                  <i className='fas fa-list me-2'></i>
                  Line Items
                </h5>
                <button
                  type='button'
                  onClick={addLineItem}
                  className='btn btn-outline-primary btn-sm'
                  disabled={loading}
                >
                  <i className='fas fa-plus me-1'></i>
                  Add Item
                </button>
              </div>

              <div className='table-responsive'>
                <table className='table table-bordered'>
                  <thead className='table-light'>
                    <tr>
                      <th style={{ width: '40%' }}>Description</th>
                      <th style={{ width: '15%' }} className='text-center'>
                        No. of Hours
                      </th>
                      <th style={{ width: '15%' }} className='text-end'>
                        Rate (Rs.)
                      </th>
                      <th style={{ width: '15%' }} className='text-end'>
                        Amount (Rs.)
                      </th>
                      <th style={{ width: '15%' }} className='text-center'>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.line_items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type='text'
                            className='form-control form-control-sm'
                            required
                            value={item.description}
                            onChange={e =>
                              updateLineItem(
                                index,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder='Item description'
                            disabled={loading}
                          />
                        </td>
                        <td>
                          <input
                            type='number'
                            className='form-control form-control-sm text-center'
                            min='1'
                            step='1'
                            required
                            value={item.quantity}
                            onChange={e =>
                              updateLineItem(
                                index,
                                'quantity',
                                parseFloat(e.target.value)
                              )
                            }
                            disabled={loading}
                          />
                        </td>
                        <td>
                          <input
                            type='number'
                            className='form-control form-control-sm text-end'
                            min='0'
                            step='1'
                            required
                            value={item.rate}
                            onChange={e =>
                              updateLineItem(
                                index,
                                'rate',
                                parseFloat(e.target.value)
                              )
                            }
                            disabled={loading}
                          />
                        </td>
                        <td>
                          <input
                            type='text'
                            className='form-control form-control-sm text-end bg-light'
                            readOnly
                            value={(parseFloat(item.amount) || 0).toFixed(2)}
                          />
                        </td>
                        <td className='text-center'>
                          <button
                            type='button'
                            onClick={() => removeLineItem(index)}
                            className='btn btn-outline-danger btn-sm'
                            title='Remove item'
                            disabled={loading}
                          >
                            <i className='fas fa-trash'></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan='4' className='text-end fw-bold'>
                        Subtotal:
                      </td>
                      <td className='text-end fw-bold'>
                        Rs. {calculateSubtotalOnly().toFixed(2)}
                      </td>
                    </tr>
                    {formData.additional_charges.length > 0 && (
                      <tr>
                        <td colSpan='4' className='text-end fw-bold text-info'>
                          Additional Charges:
                        </td>
                        <td className='text-end fw-bold text-info'>
                          Rs. {calculateTotalAdditionalCharges().toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {formData.discounts.length > 0 && (
                      <tr>
                        <td
                          colSpan='4'
                          className='text-end fw-bold text-success'
                        >
                          Total Discounts:
                        </td>
                        <td className='text-end fw-bold text-success'>
                          -Rs. {calculateTotalDiscounts().toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr className='table-primary'>
                      <td colSpan='4' className='text-end fw-bold'>
                        Grand Total:
                      </td>
                      <td className='text-end fw-bold h5 mb-0'>
                        Rs. {calculateGrandTotal().toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Additional Charges Section */}
            <div className='mb-4'>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h5 className='mb-0'>
                  <i className='fas fa-plus-circle me-2 text-info'></i>
                  Additional Charges
                </h5>
                <button
                  type='button'
                  onClick={addAdditionalCharge}
                  className='btn btn-outline-info btn-sm'
                  disabled={loading}
                >
                  <i className='fas fa-plus me-1'></i>
                  Add Charge
                </button>
              </div>

              {formData.additional_charges.length > 0 && (
                <div className='table-responsive'>
                  <table className='table table-bordered'>
                    <thead className='table-light'>
                      <tr>
                        <th style={{ width: '15%' }}>Type</th>
                        <th style={{ width: '25%' }}>Description</th>
                        <th style={{ width: '15%' }}>Quantity</th>
                        <th style={{ width: '15%' }}>Rate</th>
                        <th style={{ width: '15%' }}>Amount</th>
                        <th style={{ width: '15%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.additional_charges.map((charge, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              className='form-select form-select-sm'
                              value={charge.type}
                              onChange={e =>
                                updateAdditionalCharge(
                                  index,
                                  'type',
                                  e.target.value
                                )
                              }
                              disabled={loading}
                            >
                              <option value='overtime'>Overtime</option>
                              <option value='materials'>Materials</option>
                              <option value='travel'>Travel</option>
                              <option value='emergency'>Emergency</option>
                              <option value='other'>Other</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type='text'
                              className='form-control form-control-sm'
                              value={charge.description}
                              onChange={e =>
                                updateAdditionalCharge(
                                  index,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder='Description'
                              disabled={loading}
                            />
                            <input
                              type='text'
                              className='form-control form-control-sm mt-1'
                              value={charge.reason}
                              onChange={e =>
                                updateAdditionalCharge(
                                  index,
                                  'reason',
                                  e.target.value
                                )
                              }
                              placeholder='Reason/Justification'
                              disabled={loading}
                            />
                          </td>
                          <td>
                            <input
                              type='number'
                              className='form-control form-control-sm'
                              min='1'
                              step='1'
                              value={charge.quantity}
                              onChange={e =>
                                updateAdditionalCharge(
                                  index,
                                  'quantity',
                                  e.target.value
                                )
                              }
                              disabled={loading}
                            />
                          </td>
                          <td>
                            <input
                              type='number'
                              className='form-control form-control-sm'
                              min='0'
                              step='1'
                              value={charge.rate}
                              onChange={e =>
                                updateAdditionalCharge(
                                  index,
                                  'rate',
                                  e.target.value
                                )
                              }
                              disabled={loading}
                            />
                          </td>
                          <td>
                            <input
                              type='text'
                              className='form-control form-control-sm bg-light'
                              readOnly
                              value={`Rs. ${(parseFloat(charge.amount) || 0).toFixed(2)}`}
                            />
                          </td>
                          <td className='text-center'>
                            <button
                              type='button'
                              onClick={() => removeAdditionalCharge(index)}
                              className='btn btn-outline-danger btn-sm'
                              disabled={loading}
                            >
                              <i className='fas fa-trash'></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Discounts Section */}
            <div className='mb-4'>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h5 className='mb-0'>
                  <i className='fas fa-percent me-2 text-success'></i>
                  Discounts
                </h5>
                <button
                  type='button'
                  onClick={addDiscount}
                  className='btn btn-outline-success btn-sm'
                  disabled={loading}
                >
                  <i className='fas fa-plus me-1'></i>
                  Add Discount
                </button>
              </div>

              {formData.discounts.length > 0 && (
                <div className='table-responsive'>
                  <table className='table table-bordered'>
                    <thead className='table-light'>
                      <tr>
                        <th style={{ width: '20%' }}>Type</th>
                        <th style={{ width: '30%' }}>Description</th>
                        <th style={{ width: '15%' }}>Rate (%)</th>
                        <th style={{ width: '20%' }}>Discount Amount</th>
                        <th style={{ width: '15%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.discounts.map((discount, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              className='form-select form-select-sm'
                              value={discount.type}
                              onChange={e =>
                                updateDiscount(index, 'type', e.target.value)
                              }
                              disabled={loading}
                            >
                              <option value='percentage'>Percentage</option>
                              <option value='fixed'>Fixed Amount</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type='text'
                              className='form-control form-control-sm'
                              value={discount.description}
                              onChange={e =>
                                updateDiscount(
                                  index,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder='Discount description'
                              disabled={loading}
                            />
                            <input
                              type='text'
                              className='form-control form-control-sm mt-1'
                              value={discount.reason}
                              onChange={e =>
                                updateDiscount(index, 'reason', e.target.value)
                              }
                              placeholder='Reason for discount'
                              disabled={loading}
                            />
                          </td>
                          <td>
                            <input
                              type='number'
                              className='form-control form-control-sm'
                              min='0'
                              step={
                                discount.type === 'percentage' ? '1' : '0.1'
                              }
                              value={
                                discount.type === 'percentage'
                                  ? discount.rate
                                  : discount.amount
                              }
                              onChange={e => {
                                const field =
                                  discount.type === 'percentage'
                                    ? 'rate'
                                    : 'amount';
                                updateDiscount(index, field, e.target.value);
                              }}
                              placeholder={
                                discount.type === 'percentage' ? '%' : 'Amount'
                              }
                              disabled={loading}
                            />
                          </td>
                          <td>
                            <input
                              type='text'
                              className='form-control form-control-sm bg-light'
                              readOnly
                              value={`Rs. ${(parseFloat(discount.amount) || 0).toFixed(2)}`}
                            />
                          </td>
                          <td className='text-center'>
                            <button
                              type='button'
                              onClick={() => removeDiscount(index)}
                              className='btn btn-outline-danger btn-sm'
                              disabled={loading}
                            >
                              <i className='fas fa-trash'></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className='mb-4'>
              <label className='form-label'>
                <i className='fas fa-sticky-note me-1'></i>
                Notes (Optional)
              </label>
              <textarea
                className='form-control'
                rows='4'
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder='Add any additional notes or terms...'
                disabled={loading}
              />
            </div>
          </div>

          <div className='modal-footer border-top p-3'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading || formData.line_items.length === 0}
              className='btn btn-primary'
            >
              {loading ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2'></span>
                  Creating...
                </>
              ) : (
                <>
                  <i className='fas fa-check me-1'></i>
                  {formData.send_invoice
                    ? 'Complete Service & Send Invoice'
                    : 'Complete Service & Create Invoice'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          overflow-y: auto;
          padding: 20px;
        }

        .modal-content {
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          position: relative;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
          color: #999;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .btn-close:hover {
          color: #333;
          background: #f8f9fa;
        }

        .btn-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
          }

          .modal-content {
            margin: 0 auto;
          }

          .table-responsive {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateInvoiceModal;

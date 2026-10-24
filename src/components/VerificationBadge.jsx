import React from 'react';
import { ShieldCheck, Clock, FileScan, UploadCloud } from 'lucide-react';

const statusConfig = {
  VERIFIED: {
    label: 'Verified',
    icon: ShieldCheck,
    className: 'VERIFIED',
    desc: 'Independently confirmed via issuer link or institutional signing'
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    icon: Clock,
    className: 'PENDING_REVIEW',
    desc: 'Submitted for verification check'
  },
  OCR_PROCESSED: {
    label: 'OCR Scanned',
    icon: FileScan,
    className: 'OCR_PROCESSED',
    desc: 'Text extracted via OCR; requires issuer verification'
  },
  UPLOADED: {
    label: 'Uploaded Only',
    icon: UploadCloud,
    className: 'UPLOADED',
    desc: 'Stored in cloud; unverified'
  }
};

export const VerificationBadge = ({ status = 'UPLOADED', showTooltip = false }) => {
  const normStatus = (status || 'UPLOADED').toUpperCase();
  const config = statusConfig[normStatus] || statusConfig.UPLOADED;
  const IconComponent = config.icon;

  return (
    <span 
      className={`verify-badge ${config.className}`}
      title={showTooltip ? config.desc : undefined}
    >
      <IconComponent size={13} />
      <span>{config.label}</span>
    </span>
  );
};

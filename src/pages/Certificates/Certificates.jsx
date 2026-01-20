import React, { useState } from "react";
import { useCourseGeneration } from "../../hooks/useCourseGeneration";
import {
  Trophy,
  Award,
  ExternalLink,
  Copy,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import CertificateCard from "../../components/CertificateCard/CertificateCard";
import CertificateModal from "../../components/CertificateModal/CertificateModal";
import styles from "./Certificates.module.css";

const Certificates = () => {
  const { generatedCourses } = useCourseGeneration();
  // TODO: Implement certificate generation from completed AI courses
  const certificates = [];
  const [copiedToken, setCopiedToken] = useState(null);
  const [expandedMetadata, setExpandedMetadata] = useState({});
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const copyToClipboard = (text, tokenId) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenId);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const viewOnBlockchain = (tokenId) => {
    // In a real app, this would link to the blockchain explorer
    window.open(`https://etherscan.io/token/${tokenId}`, "_blank");
  };

  const toggleMetadata = (certificateId) => {
    setExpandedMetadata((prev) => ({
      ...prev,
      [certificateId]: !prev[certificateId],
    }));
  };

  const handleCertificateClick = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificateModal(true);
  };

  if (certificates.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Trophy size={64} />
          <h2>No Certificates Yet</h2>
          <p>
            Complete courses and claim your NFT certificates to see them here
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => (window.location.href = "/rewards")}
          >
            View Available Certificates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Certificates</h1>
        <p>Your blockchain-verified NFT certificates</p>
      </div>

      <div className={styles.certificatesGrid}>
        {certificates.map((certificate) => (
          <CertificateCard
            key={certificate.id}
            courseName={certificate.courseName}
            userName="John Doe"
            completionDate={new Date(
              certificate.claimedAt,
            ).toLocaleDateString()}
            certificateId={certificate.tokenId}
            platformName="Level Up"
            level={
              certificate.nftMetadata.attributes.find(
                (attr) => attr.trait_type === "Skill Level",
              )?.value || "Intermediate"
            }
            skillLevel={
              certificate.nftMetadata.attributes.find(
                (attr) => attr.trait_type === "Skill Level",
              )?.value || "Intermediate"
            }
            onClick={() => handleCertificateClick(certificate)}
            isClaimed={true}
          />
        ))}
      </div>

      <div className={styles.statsSection}>
        <Card className={styles.statsCard}>
          <h3>Certificate Statistics</h3>
          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <Trophy size={24} />
              <div>
                <strong>{certificates.length}</strong>
                <span>Certificates Earned</span>
              </div>
            </div>
            <div className={styles.stat}>
              <Award size={24} />
              <div>
                <strong>100%</strong>
                <span>Blockchain Verified</span>
              </div>
            </div>
            <div className={styles.stat}>
              <CheckCircle size={24} />
              <div>
                <strong>NFT</strong>
                <span>Digital Ownership</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCertificate}
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
      />
    </div>
  );
};

export default Certificates;

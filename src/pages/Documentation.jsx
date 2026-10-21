import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Download,
  BookOpen,
  Award,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { ClayCard } from '../components/ui/ClayCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { DATASET_OVERVIEW } from '../data/edaMetadata';
import { formatNumber, formatCurrency } from '../utils/formatters';

export const Documentation = () => {
  const { summary, models, segments } = useOutletContext();
  const [copied, setCopied] = useState(false);

  // Generate downloadable academic experiment report in Markdown format
  const handleExportReportMarkdown = () => {
    const reportText = `# RetailIQ — Technical Project Report & Academic Experiment Summary
## ML-Powered Customer Segmentation & Marketing Intelligence Platform
**Academic Mini-Project (15 Marks)** | **Evaluation Date:** October 2026

---

### 1. Project Overview & Problem Statement
Retailers operating high-volume transactional platforms often struggle with homogeneous marketing campaigns that fail to account for divergent customer purchasing dynamics. RetailIQ addresses this by implementing an unsupervised machine learning pipeline to segment customers using Recency, Frequency, and Monetary (RFM) behavioral features derived from transactional logs.

### 2. Dataset Attribution & Technical Specifications
- **Source:** UCI Machine Learning Repository — Online Retail Dataset
- **URL:** ${DATASET_OVERVIEW.citationUrl}
- **Original Records:** 541,909 transactions across 38 countries
- **Observation Period:** 01/12/2010 to 09/12/2011 (1 year, 8 days)
- **Currency:** Sterling (GBP, £)
- **Derived Reference Date:** ${summary?.referenceDate || '2011-12-10'}
- **Cleaned Positive Transactions:** 392,692
- **Engineered Customer Cohort:** 4,338 unique RFM customer vectors

### 3. Preprocessing & Feature Engineering
1. **Deduplication:** Dropped 5,268 exact duplicate records.
2. **Missing Customer Identification:** Removed 135,037 transactions lacking a valid CustomerID (guest checkouts unable to support temporal tracking).
3. **Cancellation Filtering:** Filtered 4,332 return/cancellation invoices (prefixed with 'C').
4. **Non-Positive Filtering:** Filtered 4,580 records with non-positive unit price or quantity.
5. **RFM Aggregation:**
   - **Recency:** Days elapsed between customer's latest purchase and reference anchor (2011-12-10).
   - **Frequency:** Count of unique positive InvoiceNo entries.
   - **Monetary:** Sum of total basket revenue (£).
6. **Feature Normalization:** Applied natural log transformation \`np.log1p\` to eliminate Pareto right-skew, followed by \`StandardScaler\` (mean=0, variance=1) to prevent Euclidean distance distortion in high monetary scales.

### 4. Clustering Algorithm Benchmark Results
Recorded from Google Colab experiment environment:
${models.map(m => `- **${m.modelName}:** Clusters: ${m.clusters} | Noise: ${m.noisePct}% | Runtime: ${m.runtime.toFixed(4)}s | Silhouette: ${m.silhouette.toFixed(4)} | Davies-Bouldin: ${m.daviesBouldin.toFixed(4)} | Calinski-Harabasz: ${m.calinskiHarabasz.toFixed(2)}`).join('\n')}

**Champion Model:** K-Means was selected based on optimal internal validation scores (Silhouette: 0.4157, Davies-Bouldin: 0.8250).

### 5. Identified Customer Segments (K-Means k=3)
${segments.map(s => `- **Cluster ${s.clusterId} (${s.name}):** ${s.customerCount} customers (${s.pctOfCustomers.toFixed(1)}%) | Median Recency: ${s.medianRecency}d | Median Frequency: ${s.medianFrequency} orders | Median Spend: £${s.medianSpending.toFixed(2)} | Total Spend: £${Number(s.totalSpending).toLocaleString()} (${s.pctOfRevenue.toFixed(1)}% of total revenue)`).join('\n')}

### 6. Limitations & Future Scope
- **Current Limitations:** Cold-start exclusion for guest checkouts; static snapshot lacking longitudinal drift tracking.
- **Future Enhancements:** Dynamic real-time ETL via FastAPI; embedding-based product affinity representations; automated churn hazard modeling.
`;

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RetailIQ_Academic_Project_Report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCitation = () => {
    const citation = "Daqing Chen, Sai Liang Sain, and Kun Guo, Data mining for the online retail industry: A case study of RFM model-based customer segmentation using data mining, Journal of Database Marketing and Customer Strategy Management, Vol. 19, No. 3, pp. 197-208, 2012.";
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Documentation Header */}
      <ClayCard className="border border-white p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="clay-badge bg-indigo-50 text-accent border border-indigo-200">
              Technical Documentation & Viva Brief
            </span>
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              RetailIQ Academic Mini-Project Specification
            </h2>
            <p className="text-xs text-text-secondary max-w-3xl leading-relaxed">
              Comprehensive reference material designed for academic demonstration, technical viva evaluation, and 10-page project report compilation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportReportMarkdown}
              className="clay-button-primary px-3.5 py-2 text-xs font-semibold"
            >
              <Download size={14} />
              Export Project Report (.md)
            </button>
          </div>
        </div>
      </ClayCard>

      {/* Project Meta Details Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ClayCard>
          <div className="flex items-center gap-2 mb-2 text-accent">
            <BookOpen size={18} />
            <h3 className="text-sm font-bold text-text-primary">Problem Statement</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Traditional retail marketing treats heterogeneous consumer populations as a monolith. RetailIQ leverages unsupervised machine learning to partition 4,338 retail accounts into distinct behavioral segments based on temporal recency, transaction frequency, and monetary contribution.
          </p>
        </ClayCard>

        <ClayCard>
          <div className="flex items-center gap-2 mb-2 text-status-success">
            <Award size={18} />
            <h3 className="text-sm font-bold text-text-primary">Evaluation Objectives</h3>
          </div>
          <ul className="text-xs text-text-secondary space-y-1.5 list-disc list-inside">
            <li>Rigorous 8-stage data cleaning & RFM transformation.</li>
            <li>Multi-paradigm algorithmic comparison (4 models).</li>
            <li>Interactive visual exploration without static mockups.</li>
            <li>Evidence-based marketing playbooks for each segment.</li>
          </ul>
        </ClayCard>

        <ClayCard>
          <div className="flex items-center gap-2 mb-2 text-status-warning">
            <Database size={18} />
            <h3 className="text-sm font-bold text-text-primary">Dataset Attribution</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-2">
            Dataset sourced from the <strong>UCI Machine Learning Repository</strong>. Licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
          </p>
          <button
            onClick={handleCopyCitation}
            className="clay-button px-2.5 py-1 text-[11px] font-medium"
          >
            {copied ? <Check size={12} className="text-status-success" /> : <Copy size={12} />}
            <span>{copied ? 'Citation Copied' : 'Copy Academic Citation'}</span>
          </button>
        </ClayCard>
      </div>

      {/* Viva Question & Answer Preparation Cards */}
      <ClayCard>
        <SectionHeader
          title="Technical Viva & Examiner Defense Cheatsheet"
          subtitle="Anticipated technical defense questions with mathematically sound responses."
          badge="Viva Q&A"
        />

        <div className="space-y-4">
          <div className="clay-inset p-4 rounded-xl text-xs space-y-1.5">
            <div className="font-bold text-text-primary flex items-center gap-2">
              <span className="text-accent font-mono">Q1:</span>
              Why did K-Means outperform DBSCAN and GMM on this dataset?
            </div>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Answer:</strong> Following log transformation and standard scaling, the RFM feature distributions form approximately spherical, convex density structures. K-Means is mathematically optimized for minimizing within-cluster spherical variance, resulting in superior Silhouette (0.4157) and Davies-Bouldin (0.8250) scores. In contrast, GMM struggled with high component overlap (0.1904 Silhouette), and DBSCAN merged continuous density regions into just two macro-clusters while treating 2.19% of valuable points as noise.
            </p>
          </div>

          <div className="clay-inset p-4 rounded-xl text-xs space-y-1.5">
            <div className="font-bold text-text-primary flex items-center gap-2">
              <span className="text-accent font-mono">Q2:</span>
              Why was np.log1p applied before StandardScaler?
            </div>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Answer:</strong> Standard scaling centers data to zero mean and unit variance (\(z = (x - \mu)/\sigma\)), but it does not remove severe positive skewness. In the raw RFM features, monetary values span up to £280,000 while median spend is £508. Without logarithmic transformation, extreme outliers heavily inflate \(\sigma\), compressing 95% of normal customer vectors into an indiscernible micro-cluster near zero.
            </p>
          </div>

          <div className="clay-inset p-4 rounded-xl text-xs space-y-1.5">
            <div className="font-bold text-text-primary flex items-center gap-2">
              <span className="text-accent font-mono">Q3:</span>
              How was the reference date for Recency established?
            </div>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Answer:</strong> The latest recorded transaction in the cleaned dataset is <strong>2011-12-09 12:50:00</strong>. In standard RFM methodology, the analysis reference anchor is designated as the day immediately following the data collection boundary (<strong>2011-12-10</strong>), ensuring that the most recent purchases receive a non-negative Recency value of 0 or 1 days.
            </p>
          </div>

          <div className="clay-inset p-4 rounded-xl text-xs space-y-1.5">
            <div className="font-bold text-text-primary flex items-center gap-2">
              <span className="text-accent font-mono">Q4:</span>
              How were the evaluation metrics calculated for DBSCAN?
            </div>
            <p className="text-text-secondary leading-relaxed">
              <strong className="text-text-primary">Answer:</strong> DBSCAN classifies 95 points (2.19%) as noise (cluster label -1). Internal validation metrics like Silhouette and Davies–Bouldin cannot evaluate unassigned noise vectors; therefore, they were calculated strictly on the core partitioned points. Consequently, DBSCAN scores must always be evaluated alongside its noise percentage and reduced cluster count (k=2).
            </p>
          </div>
        </div>
      </ClayCard>

      {/* Limitations & Future Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClayCard>
          <div className="flex items-center gap-2 mb-2 text-status-danger">
            <ShieldCheck size={18} />
            <h3 className="text-sm font-bold text-text-primary">Documented Project Limitations</h3>
          </div>
          <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Guest Checkout Exclusion:</strong> 135,080 records (24.93%) lacked CustomerID identifiers and had to be discarded from RFM modeling.</li>
            <li><strong>Static Temporal Snapshot:</strong> Does not capture longitudinal cluster transitions (e.g. a customer migrating from Cluster 0 to Cluster 1 over time).</li>
            <li><strong>Absence of Product Semantics:</strong> RFM models monetary totals but does not incorporate product category text embeddings (e.g. BERT vectors).</li>
          </ul>
        </ClayCard>

        <ClayCard>
          <div className="flex items-center gap-2 mb-2 text-accent">
            <Cpu size={18} />
            <h3 className="text-sm font-bold text-text-primary">Future Research Scope</h3>
          </div>
          <ul className="text-xs text-text-secondary space-y-2 list-disc list-inside leading-relaxed">
            <li><strong>Deep Autoencoder Embeddings:</strong> Combining categorical product embeddings with RFM features using Variational Autoencoders.</li>
            <li><strong>Dynamic Longitudinal Tracking:</strong> Implementing Markov transition matrices to predict customer segment drift month-over-month.</li>
            <li><strong>FastAPI Production Backend:</strong> Connecting the modular client data-access layer to a real-time streaming ETL API.</li>
          </ul>
        </ClayCard>
      </div>
    </div>
  );
};
